import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { trackEvent } from '../utils/track';

const STORAGE_KEY = 'focustech_cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: newQty } : i
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          price: Number(product.price),
          stock: product.stock,
          image: product.main_image,
          category_name: product.category_name,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
    trackEvent('add_to_cart', `/producto/${product.slug}`, {
      product_id: product.id,
      quantity,
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.product_id !== productId) return i;
          const qty = Math.max(1, Math.min(quantity, i.stock));
          return { ...i, quantity: qty };
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value = {
    items,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
