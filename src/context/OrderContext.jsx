import { createContext, useContext, useMemo, useState } from "react";

const ORDER_KEY = "shikhar_orders";

function readStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistOrders(orders) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

function makeOrderNumber() {
  return `SHK-${Date.now().toString(36).toUpperCase()}`;
}

function createOrder(items, subtotal) {
  const now = new Date();
  const eta = new Date(now);
  eta.setDate(eta.getDate() + 4);

  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderNumber: makeOrderNumber(),
    statusIndex: 1,
    statusLabel: "Confirmed",
    createdAt: now.toISOString(),
    estimatedDelivery: eta.toISOString(),
    subtotal,
    items: items.map((item) => ({ ...item })),
  };
}

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => readStoredOrders());

  const placeOrder = (items, subtotal) => {
    if (!Array.isArray(items) || items.length === 0) return null;

    const nextOrder = createOrder(items, subtotal);

    setOrders((prev) => {
      const updated = [nextOrder, ...prev];
      persistOrders(updated);
      window.dispatchEvent(new Event("orders-changed"));
      return updated;
    });

    return nextOrder;
  };

  const getOrderById = (orderId) =>
    orders.find((order) => String(order.id) === String(orderId));

  const value = useMemo(
    () => ({
      orders,
      placeOrder,
      getOrderById,
    }),
    [orders],
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
}
