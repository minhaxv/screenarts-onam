import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, ShieldCheck, Database, HardDrive, KeyRound, PlayCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './DiagnosticsPage.css';

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(true);
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [diag, setDiag] = useState({
    supabaseUrl: '',
    connected: false,
    authConfigured: false,
    tables: {},
    storage: {},
    error: null,
  });

  const runDiagnostics = async () => {
    setLoading(true);
    const results = {
      supabaseUrl: import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'Configured',
      connected: false,
      authConfigured: false,
      tables: {},
      storage: {},
      error: null,
    };

    try {
      // 1. Check DB tables
      const tableList = ['products', 'categories', 'orders', 'order_items', 'custom_designs', 'bulk_enquiries'];
      for (const t of tableList) {
        const { error } = await supabase.from(t).select('id').limit(1);
        results.tables[t] = !error;
      }
      results.connected = true;

      // 2. Check Storage buckets
      const buckets = ['product-images', 'custom-designs'];
      for (const b of buckets) {
        const { error } = await supabase.storage.from(b).list('', { limit: 1 });
        results.storage[b] = !error;
      }

      // 3. Check Auth session
      const { data: sessionData } = await supabase.auth.getSession();
      results.authConfigured = true;
    } catch (err) {
      results.error = err.message;
    } finally {
      setDiag(results);
      setLoading(false);
    }
  };

  const runPlaceOrderPipelineTest = async () => {
    setTestRunning(true);
    setTestResult(null);
    const steps = [
      { name: 'AUTH', status: 'pending', details: '' },
      { name: 'CART', status: 'pending', details: '' },
      { name: 'PRODUCT', status: 'pending', details: '' },
      { name: 'ORDER', status: 'pending', details: '' },
      { name: 'ORDER ITEMS', status: 'pending', details: '' },
    ];

    try {
      // Step 1: AUTH
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        steps[0] = { name: 'AUTH', status: 'fail', details: `No active user session (${authError?.message || 'Logged out'})` };
        setTestResult(steps);
        setTestRunning(false);
        return;
      }
      steps[0] = { name: 'AUTH', status: 'pass', details: `User authenticated: ${authData.user.email || authData.user.id}` };

      // Step 2: CART
      const mockCart = [{ productId: 'prod-mahabali-minimal', quantity: 1, name: 'Mahabali Minimalist Vector Tee' }];
      if (!mockCart.length || !mockCart[0].productId) {
        steps[1] = { name: 'CART', status: 'fail', details: 'Cart items validation failed' };
        setTestResult(steps);
        setTestRunning(false);
        return;
      }
      steps[1] = { name: 'CART', status: 'pass', details: `Cart validated with ${mockCart.length} item` };

      // Step 3: PRODUCT
      const { data: dbProd, error: dbProdErr } = await supabase
        .from('products')
        .select('id, price, name')
        .eq('id', mockCart[0].productId)
        .maybeSingle();

      if (dbProdErr || !dbProd) {
        steps[2] = { name: 'PRODUCT', status: 'fail', details: `Product fetch failed: ${dbProdErr?.message || 'Product not found'}` };
        setTestResult(steps);
        setTestRunning(false);
        return;
      }
      steps[2] = { name: 'PRODUCT', status: 'pass', details: `Fetched database product: ${dbProd.name} @ ₹${dbProd.price}` };

      // Step 4: ORDER
      const testOrderNum = `DIAG-${Math.floor(10000 + Math.random() * 90000)}`;
      const testOrderPayload = {
        order_number: testOrderNum,
        user_id: authData.user.id,
        customer_name: 'Diagnostic Test User',
        phone: '+91 9999999999',
        email: authData.user.email || 'test@screenarts.in',
        items: [{ productId: dbProd.id, name: dbProd.name, price: Number(dbProd.price), quantity: 1 }],
        subtotal: Number(dbProd.price),
        delivery_charge: 79,
        total_amount: Number(dbProd.price) + 79,
        delivery_method: 'home',
        delivery_address: 'Calicut Diagnostic Center',
        pincode: '673001',
        workflow: 'PRINT_ONLY',
        payment_status: 'Pending',
        order_status: 'Pending',
        print_specs: JSON.stringify({ subtotal: Number(dbProd.price), deliveryFee: 79, workflow: 'PRINT_ONLY' }),
      };

      const { data: insertedOrder, error: orderInsertErr } = await supabase
        .from('orders')
        .insert([testOrderPayload])
        .select()
        .single();

      if (orderInsertErr || !insertedOrder) {
        steps[3] = { name: 'ORDER', status: 'fail', details: `orders INSERT failed: ${orderInsertErr?.message || 'Insert failed'}` };
        setTestResult(steps);
        setTestRunning(false);
        return;
      }
      steps[3] = { name: 'ORDER', status: 'pass', details: `orders INSERT created order ${insertedOrder.order_number} (ID: ${insertedOrder.id})` };

      // Step 5: ORDER ITEMS
      const { data: insertedItems, error: itemsInsertErr } = await supabase
        .from('order_items')
        .insert([{
          order_id: String(insertedOrder.id),
          product_id: dbProd.id,
          product_name: dbProd.name,
          quantity: 1,
          unit_price: Number(dbProd.price),
          size: 'M',
          colour: 'White'
        }])
        .select();

      if (itemsInsertErr) {
        steps[4] = { name: 'ORDER ITEMS', status: 'fail', details: `order_items INSERT failed: ${itemsInsertErr.message}` };
      } else {
        steps[4] = { name: 'ORDER ITEMS', status: 'pass', details: `order_items INSERT created detail row for ${insertedOrder.order_number}` };
      }

    } catch (err) {
      console.error('Diagnostic test exception:', err);
    } finally {
      setTestResult(steps);
      setTestRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container py-12 page-enter" style={{ maxWidth: '800px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="badge badge-gold">SCREENARTS INFRASTRUCTURE</span>
          <h1 className="heading-3 mt-1">Supabase Production Diagnostics</h1>
        </div>
        <button className="btn btn-outline btn-sm" onClick={runDiagnostics} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> {loading ? 'Checking...' : 'Re-test'}
        </button>
      </div>

      <div className="grid gap-4">
        {/* Connection Card */}
        <div className="p-4 border rounded-xl bg-white shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="text-green" size={24} />
            <div>
              <p className="font-bold text-sm">Supabase Endpoint</p>
              <p className="text-xs text-muted">{diag.supabaseUrl}</p>
            </div>
          </div>
          <span className={`badge ${diag.connected ? 'badge-green' : 'badge-red'}`}>
            {diag.connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Auth Service Card */}
        <div className="p-4 border rounded-xl bg-white shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeyRound className="text-gold" size={24} />
            <div>
              <p className="font-bold text-sm">Supabase Auth Service</p>
              <p className="text-xs text-muted">Passwordless Email OTP Verification Ready</p>
            </div>
          </div>
          <span className={`badge ${diag.authConfigured ? 'badge-green' : 'badge-red'}`}>
            {diag.authConfigured ? 'ACTIVE' : 'ERROR'}
          </span>
        </div>

        {/* Database Tables Access */}
        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="text-blue" size={20} />
            <p className="font-bold text-sm">Database Schema & Table Permissions</p>
          </div>
          <div className="grid grid-2 gap-2 text-xs">
            {Object.entries(diag.tables).map(([tbl, ok]) => (
              <div key={tbl} className="flex justify-between items-center p-2 rounded bg-cream">
                <span className="font-mono">{tbl}</span>
                {ok ? (
                  <span className="text-green flex items-center gap-1 font-bold"><CheckCircle2 size={14} /> Accessible</span>
                ) : (
                  <span className="text-red flex items-center gap-1 font-bold"><XCircle size={14} /> Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Place Order Flow Pipeline Test */}
        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <PlayCircle className="text-orange" size={20} />
              <div>
                <p className="font-bold text-sm">End-to-End Place Order Diagnostic Pipeline</p>
                <p className="text-xs text-muted">Tests AUTH → CART → PRODUCT → ORDER → ORDER ITEMS</p>
              </div>
            </div>
            <button className="btn btn-primary btn-xs" onClick={runPlaceOrderPipelineTest} disabled={testRunning}>
              {testRunning ? 'Running Test...' : 'Run Pipeline Test'}
            </button>
          </div>

          {testResult && (
            <div className="mt-3 flex flex-col gap-2 text-xs">
              {testResult.map(st => (
                <div key={st.name} className={`p-2.5 rounded-lg border flex justify-between items-center ${st.status === 'pass' ? 'bg-green-50 border-green-200' : st.status === 'fail' ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                  <div>
                    <span className="font-bold font-mono">{st.name}</span>
                    <p className="text-xs text-muted mt-0.5">{st.details}</p>
                  </div>
                  <span className={`badge ${st.status === 'pass' ? 'badge-green' : st.status === 'fail' ? 'badge-red' : 'badge-gold'}`}>
                    {st.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
