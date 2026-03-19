import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ORDER_KEY = "shikhar_orders";
const ORDER_STAGES = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

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

function normalizeStatus(index, fallbackLabel = "Processing") {
  if (Number.isInteger(index) && index >= 0 && index < ORDER_STAGES.length) {
    return {
      statusIndex: index,
      statusLabel: ORDER_STAGES[index],
    };
  }

  return {
    statusIndex: 0,
    statusLabel: fallbackLabel,
  };
}

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => readStoredOrders());

  useEffect(() => {
    const refreshOrders = () => {
      setOrders(readStoredOrders());
    };

    const handleStorage = (event) => {
      if (event.key === ORDER_KEY) {
        refreshOrders();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("orders-changed", refreshOrders);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("orders-changed", refreshOrders);
    };
  }, []);

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

  const updateOrderStatus = (orderId, statusIndex, statusLabel) => {
    let updatedOrder = null;
    const normalized = normalizeStatus(
      statusIndex,
      statusLabel || "Processing",
    );

    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (String(order.id) !== String(orderId)) return order;

        updatedOrder = {
          ...order,
          statusIndex: normalized.statusIndex,
          statusLabel: statusLabel || normalized.statusLabel,
          updatedAt: new Date().toISOString(),
        };
        return updatedOrder;
      });

      persistOrders(updated);
      window.dispatchEvent(new Event("orders-changed"));
      return updated;
    });

    return updatedOrder;
  };

  const value = useMemo(
    () => ({
      orders,
      placeOrder,
      getOrderById,
      updateOrderStatus,
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
