// src\context\CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api from "../utils/api";
import { isAuthenticated } from "../App";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch cart from API ──────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await api.get("cart/");
      // Normalise API cart items into the shape the rest of the app expects
      const normalised = (res.data.items || []).map((item) => ({
        id:          item.product_id,
        cartItemId:  item.id,          // DB primary key — needed for delete/patch
        name:        item.product_name,
        category:    item.product_category,
        price:       parseFloat(item.price),
        size:        item.size,
        quantity:    item.quantity,
        image:       item.image || null,
      }));
      setItems(normalised);
    } catch {
      // Silently fail — cart just stays empty
    }
  }, []);

  // Load cart on mount and whenever auth changes
  useEffect(() => {
    fetchCart();
    const handler = () => fetchCart();
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [fetchCart]);

  // ── Add item ─────────────────────────────────────────
  const addItem = useCallback(async (nextItem) => {
    setLoading(true);
    try {
      const res = await api.post("cart/items/", {
        product_id: nextItem.id,
        size:       nextItem.size,
        quantity:   nextItem.quantity,
      });
      const normalised = (res.data.items || []).map((item) => ({
        id:         item.product_id,
        cartItemId: item.id,
        name:       item.product_name,
        category:   item.product_category,
        price:      parseFloat(item.price),
        size:       item.size,
        quantity:   item.quantity,
        image:      item.image || null,
      }));
      setItems(normalised);
      window.dispatchEvent(new Event("cart-changed"));
    } catch {
      // Optimistic fallback — add locally so UI isn't broken
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.id === nextItem.id && i.size === nextItem.size
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            quantity: Math.min(10, updated[idx].quantity + nextItem.quantity),
          };
          return updated;
        }
        return [...prev, nextItem];
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Update quantity ───────────────────────────────────
  const updateQuantity = useCallback(async (productId, size, quantity) => {
    const item = items.find((i) => i.id === productId && i.size === size);
    if (!item?.cartItemId) return;

    const nextQty = Math.max(1, Math.min(10, quantity));

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === productId && i.size === size ? { ...i, quantity: nextQty } : i
      )
    );

    try {
      await api.patch(`cart/items/${item.cartItemId}/`, { quantity: nextQty });
    } catch {
      // Revert on failure
      fetchCart();
    }
  }, [items, fetchCart]);

  // ── Remove item ───────────────────────────────────────
  const removeItem = useCallback(async (productId, size) => {
    const item = items.find((i) => i.id === productId && i.size === size);
    if (!item?.cartItemId) return;

    // Optimistic remove
    setItems((prev) =>
      prev.filter((i) => !(i.id === productId && i.size === size))
    );
    window.dispatchEvent(new Event("cart-changed"));

    try {
      await api.delete(`cart/items/${item.cartItemId}/`);
    } catch {
      // Revert on failure
      fetchCart();
    }
  }, [items, fetchCart]);

  // ── Clear cart ────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setItems([]);
    window.dispatchEvent(new Event("cart-changed"));
    try {
      await api.delete("cart/");
    } catch {
      fetchCart();
    }
  }, [fetchCart]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal  = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value = useMemo(
    () => ({ items, itemCount, subtotal, loading, addItem, updateQuantity, removeItem, clearCart, fetchCart }),
    [items, itemCount, subtotal, loading, addItem, updateQuantity, removeItem, clearCart, fetchCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}