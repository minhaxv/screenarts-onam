import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'screenarts_cart';

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, options = {}) => {
    const {
      colour = 'white',
      size = 'M',
      quantity = 1,
      printLocation = 'front',
      customDesign = null,
      customText = null,
      printType = 'standard',
    } = options;

    const itemKey = `${product.id}-${colour}-${size}-${printLocation}-${printType}`;

    setItems(prev => {
      const existing = prev.find(item => item.key === itemKey);
      if (existing) {
        return prev.map(item =>
          item.key === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        key: itemKey,
        productId: product.id,
        name: product.name,
        price: product.price,
        colour,
        size,
        quantity,
        printLocation,
        printType,
        customDesign,
        customText,
        image: product.images?.front || '',
      }];
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }, []);

  const removeItem = useCallback((key) => {
    setItems(prev => prev.filter(item => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(item =>
        item.key === key ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 999 ? 0 : 79;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      deliveryFee,
      total,
      isCartOpen,
      justAdded,
      setIsCartOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
