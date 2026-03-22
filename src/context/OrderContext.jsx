// src\context\OrderContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import api from "../utils/api";
import { isAuthenticated } from "../App";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch orders from API ─────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    try {
      const res = await api.get("orders/");
      // Normalise to the shape MyOrders.jsx and Admin.jsx already expect
      const normalised = res.data.map((o) => ({
        id:                String(o.id),
        orderNumber:       o.order_number,
        statusLabel:       o.status,
        statusIndex:       o.status_index,
        subtotal:          parseFloat(o.subtotal),
        createdAt:         o.created_at,
        estimatedDelivery: o.estimated_delivery,
        items:             (o.items || []).map((item) => ({
          id:       item.id,
          name:     item.name,
          category: item.category,
          price:    parseFloat(item.price),
          size:     item.size,
          quantity: item.quantity,
        })),
      }));
      setOrders(normalised);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const handler = () => fetchOrders();
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [fetchOrders]);

  // ── Place order (checkout) ────────────────────────────
  // Called by Navbar checkout button — posts to API which reads the DB cart
  const placeOrder = useCallback(async () => {
    try {
      const res = await api.post("orders/");
      const o = res.data;
      const newOrder = {
        id:                String(o.id),
        orderNumber:       o.order_number,
        statusLabel:       o.status,
        statusIndex:       o.status_index,
        subtotal:          parseFloat(o.subtotal),
        createdAt:         o.created_at,
        estimatedDelivery: o.estimated_delivery,
        items:             (o.items || []).map((item) => ({
          id:       item.id,
          name:     item.name,
          category: item.category,
          price:    parseFloat(item.price),
          size:     item.size,
          quantity: item.quantity,
        })),
      };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      console.error("Order placement failed:", err);
      return null;
    }
  }, []);

  // ── Update order status (admin) ───────────────────────
  const updateOrderStatus = useCallback(async (orderId, statusIndex, statusLabel) => {
    try {
      const res = await api.patch(`admin/orders/${orderId}/`, { status: statusLabel });
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) =>
          String(o.id) === String(orderId)
            ? { ...o, statusLabel: updated.status, statusIndex: updated.status_index }
            : o
        )
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({ orders, loading, fetchOrders, placeOrder, updateOrderStatus }),
    [orders, loading, fetchOrders, placeOrder, updateOrderStatus]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}