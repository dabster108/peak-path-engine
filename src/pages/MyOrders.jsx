import { Link, useLocation, useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import { formatNpr } from "../utils/currency";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import "./MyOrders.css";

const ORDER_STAGES = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("en-NP", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDeliveryDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-NP", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MyOrders() {
  useScrollAnimations();

  const { orders } = useOrders();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedOrderId = new URLSearchParams(location.search).get("orderId");

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (sortedOrders.length === 0) {
    return (
      <main className="orders-page">
        <section className="orders-hero">
          <div className="container orders-hero__inner">
            <span className="section-label">Orders</span>
            <h1>My Orders</h1>
            <p>
              Track your latest purchases and delivery progress in one place.
            </p>
          </div>
        </section>

        <section className="container orders-empty reveal">
          <h2>No orders yet</h2>
          <p>Once you place an order, tracking details will appear here.</p>
          <Link className="btn btn-primary" to="/">
            Start Shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <section className="orders-hero">
        <div className="container orders-hero__inner">
          <span className="section-label">Orders</span>
          <h1>My Orders</h1>
          <p>
            Track your order progress and estimated delivery date in real time.
          </p>
        </div>
      </section>

      <section className="container orders-list">
        {sortedOrders.map((order) => {
          const activeStage = Number.isInteger(order.statusIndex)
            ? order.statusIndex
            : 0;
          const isHighlighted =
            selectedOrderId && String(selectedOrderId) === String(order.id);

          return (
            <article
              key={order.id}
              className={`order-card reveal${isHighlighted ? " order-card--highlight" : ""}`}
            >
              <header className="order-card__header">
                <div>
                  <p className="order-card__meta">
                    Order ID: {order.orderNumber}
                  </p>
                  <h2>
                    Placed on <span>{formatDate(order.createdAt)}</span>
                  </h2>
                </div>
                <span className="order-badge">
                  {order.statusLabel || "Processing"}
                </span>
              </header>

              <div className="order-card__summary">
                <div>
                  <p>Items</p>
                  <strong>
                    {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </strong>
                </div>
                <div>
                  <p>Total</p>
                  <strong>{formatNpr(order.subtotal)}</strong>
                </div>
                <div>
                  <p>Estimated Delivery</p>
                  <strong>{formatDeliveryDate(order.estimatedDelivery)}</strong>
                </div>
              </div>

              <div className="order-track">
                {ORDER_STAGES.map((stage, index) => {
                  const stateClass =
                    index < activeStage
                      ? "done"
                      : index === activeStage
                        ? "active"
                        : "pending";

                  return (
                    <div
                      key={stage}
                      className={`order-track__step ${stateClass}`}
                    >
                      <span className="order-track__dot" />
                      <p>{stage}</p>
                    </div>
                  );
                })}
              </div>

              <div className="order-card__items">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.id}-${item.size}`}>
                    <p>{item.name}</p>
                    <span>
                      Qty {item.quantity} · Size {item.size}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-card__actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
