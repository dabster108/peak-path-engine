import { createContext, useContext, useMemo, useState } from "react";

const CART_KEY = "shikhar_cart";

function readStoredCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart());

  const addItem = (nextItem) => {
    setItems((prev) => {
      const index = prev.findIndex(
        (item) => item.id === nextItem.id && item.size === nextItem.size,
      );

      let updated;
      if (index >= 0) {
        updated = [...prev];
        const existing = updated[index];
        updated[index] = {
          ...existing,
          quantity: Math.min(10, existing.quantity + nextItem.quantity),
        };
      } else {
        updated = [...prev, nextItem];
      }

      persistCart(updated);
      window.dispatchEvent(new Event("cart-changed"));
      return updated;
    });
  };

  const updateQuantity = (id, size, quantity) => {
    setItems((prev) => {
      const nextQty = Math.max(1, Math.min(10, quantity));
      const updated = prev.map((item) => {
        if (item.id === id && item.size === size) {
          return { ...item, quantity: nextQty };
        }
        return item;
      });
      persistCart(updated);
      window.dispatchEvent(new Event("cart-changed"));
      return updated;
    });
  };

  const removeItem = (id, size) => {
    setItems((prev) => {
      const updated = prev.filter(
        (item) => !(item.id === id && item.size === size),
      );
      persistCart(updated);
      window.dispatchEvent(new Event("cart-changed"));
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    persistCart([]);
    window.dispatchEvent(new Event("cart-changed"));
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
