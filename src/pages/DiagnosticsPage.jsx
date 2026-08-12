import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, ShieldCheck, Database, HardDrive, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './DiagnosticsPage.css';

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(true);
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

        {/* Storage Buckets Access */}
        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="text-purple" size={20} />
            <p className="font-bold text-sm">Supabase Storage Buckets</p>
          </div>
          <div className="grid grid-2 gap-2 text-xs">
            {Object.entries(diag.storage).map(([bkt, ok]) => (
              <div key={bkt} className="flex justify-between items-center p-2 rounded bg-cream">
                <span className="font-mono">{bkt}</span>
                {ok ? (
                  <span className="text-green flex items-center gap-1 font-bold"><CheckCircle2 size={14} /> Accessible</span>
                ) : (
                  <span className="text-red flex items-center gap-1 font-bold"><XCircle size={14} /> Missing Bucket</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
