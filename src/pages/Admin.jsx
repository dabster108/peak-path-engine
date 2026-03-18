import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatNpr } from "../utils/currency";
import api from "../utils/api";
import "./Admin.css";

const emptyForm = () => ({
  name: "",
  category: "",
  price: "",
  stock: "",
  badge: "",
  section: "",
  imageFile: null,
  imagePreview: "",
});

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_CATEGORIES = ["Men's", "Women's", "Unisex"];
const DEFAULT_SECTIONS = [
  "Footwear",
  "Backpacks",
  "Bottles",
  "Equipment",
  "Goretex",
];
const DEFAULT_BADGES = ["", "New", "Sale", "Limited"];

const uniqueNonEmpty = (items) => [...new Set(items.filter(Boolean))];

/* ───── stat card ───── */
function StatCard({ icon, label, value, sub, color, delay }) {
  return (
    <div className="admin-stat-card" style={{ animationDelay: delay }}>
      <div className="admin-stat-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="admin-stat-body">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
        {sub && <div className="admin-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productImageMap, setProductImageMap] = useState({});

  /* ── DB-driven dropdowns ── */
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [badges, setBadges] = useState([]);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStock, setFilterStock] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm());
  const [addError, setAddError] = useState("");
  const [adminProfile, setAdminProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const toastTimer = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      setAddForm((f) => ({ ...f, imageFile: null, imagePreview: "" }));
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setAddError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAddForm((f) => ({
        ...f,
        imageFile: file,
        imagePreview: typeof reader.result === "string" ? reader.result : "",
      }));
      setAddError("");
    };
    reader.onerror = () => {
      setAddError("Could not read image file. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  /* ── toast helper (defined before useEffects that use it) ── */
  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  /* ── auth guard ── */
  useEffect(() => {
    api
      .get("profile/")
      .then((res) => {
        const canAccess = Boolean(
          res.data?.is_superuser ||
          res.data?.is_staff ||
          res.data?.role === "admin",
        );
        setAdminProfile(res.data);
        setProfileForm({
          username: res.data?.username || "",
          first_name: res.data?.first_name || "",
          last_name: res.data?.last_name || "",
          email: res.data?.email || "",
        });
        if (!canAccess) navigate("/");
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  useEffect(() => {
    if (tab !== "users") return;

    setUsersLoading(true);
    api
      .get("users/")
      .then((res) => setUsers(res.data))
      .catch(() => showToast("Failed to load users.", "warning"))
      .finally(() => setUsersLoading(false));
  }, [tab]);

  /* ── load categories, sections, badges from DB ── */
  useEffect(() => {
    Promise.all([
      api.get("categories/"),
      api.get("sections/"),
      api.get("badges/"),
    ])
      .then(([catRes, secRes, badRes]) => {
        const apiCategories = uniqueNonEmpty(catRes.data.map((c) => c.name));
        const apiSections = uniqueNonEmpty(secRes.data.map((s) => s.name));
        const apiBadges = uniqueNonEmpty(badRes.data.map((b) => b.name));

        setCategories(
          uniqueNonEmpty([...DEFAULT_CATEGORIES, ...apiCategories]),
        );
        setSections(uniqueNonEmpty([...DEFAULT_SECTIONS, ...apiSections]));
        setBadges(["", ...uniqueNonEmpty([...DEFAULT_BADGES, ...apiBadges])]);
      })
      .catch(() => {
        setCategories(DEFAULT_CATEGORIES);
        setSections(DEFAULT_SECTIONS);
        setBadges(DEFAULT_BADGES);
        showToast("Using default dropdown options.", "warning");
      });
  }, []);

  /* ── keep dropdowns populated using loaded products too ── */
  useEffect(() => {
    if (!products.length) return;

    const productCategories = uniqueNonEmpty(products.map((p) => p.category));
    const productSections = uniqueNonEmpty(products.map((p) => p.section));
    const productBadges = uniqueNonEmpty(products.map((p) => p.badge));

    setCategories((prev) =>
      uniqueNonEmpty([...DEFAULT_CATEGORIES, ...prev, ...productCategories]),
    );
    setSections((prev) =>
      uniqueNonEmpty([...DEFAULT_SECTIONS, ...prev, ...productSections]),
    );
    setBadges((prev) => [
      "",
      ...uniqueNonEmpty([...DEFAULT_BADGES, ...prev, ...productBadges]),
    ]);
  }, [products]);

  /* ── load products from API ── */
  useEffect(() => {
    api
      .get("products/")
      .then((res) => setProducts(res.data))
      .catch(() => showToast("Failed to load products.", "warning"))
      .finally(() => setProductsLoading(false));
  }, []);

  /* ── derived stats ── */
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 8).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  /* ── filtered list ── */
  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.section || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || p.category === filterCat;
    const matchStock =
      filterStock === "All" ||
      (filterStock === "In Stock" && p.stock > 8) ||
      (filterStock === "Low" && p.stock > 0 && p.stock <= 8) ||
      (filterStock === "Out" && p.stock === 0);
    return matchSearch && matchCat && matchStock;
  });

  /* ── inline edit ── */
  const startEdit = (p) => {
    setEditingId(p.id);
    setEditRow({
      ...p,
      imageFile: null,
      imagePreview: getProductImage(p),
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditRow({});
  };

  const handleEditImageSelect = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      showToast("Please select a JPG, PNG, or WebP image.", "warning");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditRow((row) => ({
        ...row,
        imageFile: file,
        imagePreview: typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.onerror = () => {
      showToast(
        "Could not read image file. Please try another image.",
        "warning",
      );
    };
    reader.readAsDataURL(file);
  };

  const saveEdit = async () => {
    if (!editRow.name.trim()) return;
    try {
      const res = await api.patch(`products/${editingId}/`, {
        name: editRow.name,
        category: editRow.category,
        section: editRow.section,
        badge: editRow.badge || null,
        price: Number(editRow.price),
        stock: Number(editRow.stock),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? res.data : p)),
      );
      if (hasOwn(editRow, "imagePreview")) {
        setProductImageMap((prev) => ({
          ...prev,
          [editingId]: editRow.imagePreview || "",
        }));
      }
      setEditingId(null);
      setEditRow({});
      showToast("Product updated.");
    } catch {
      showToast("Failed to update product.", "warning");
    }
  };

  /* ── delete ── */
  const confirmDelete = (id) => setDeleteConfirm(id);

  const doDelete = async () => {
    try {
      await api.delete(`products/${deleteConfirm}/`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm));
      setProductImageMap((prev) => {
        const next = { ...prev };
        delete next[deleteConfirm];
        return next;
      });
      setDeleteConfirm(null);
      showToast("Product deleted.", "warning");
    } catch {
      showToast("Failed to delete product.", "warning");
      setDeleteConfirm(null);
    }
  };

  /* ── add product ── */
  const handleAdd = async () => {
    if (!addForm.name.trim()) {
      setAddError("Product name is required.");
      return;
    }
    if (!addForm.price || isNaN(Number(addForm.price))) {
      setAddError("Enter a valid price.");
      return;
    }
    if (!addForm.category) {
      setAddError("Please select a category.");
      return;
    }
    if (!addForm.section) {
      setAddError("Please select a section.");
      return;
    }
    if (addForm.stock === "" || isNaN(Number(addForm.stock))) {
      setAddError("Enter a valid stock quantity.");
      return;
    }

    try {
      const selectedImagePreview = addForm.imagePreview;
      const res = await api.post("add-product/", {
        name: addForm.name.trim(),
        category: addForm.category,
        section: addForm.section,
        badge: addForm.badge || null,
        price: Number(addForm.price),
        stock: Number(addForm.stock),
      });

      if (selectedImagePreview && res.data?.id) {
        setProductImageMap((prev) => ({
          ...prev,
          [res.data.id]: selectedImagePreview,
        }));
      }

      const newProduct = {
        ...res.data,
        imagePreview: selectedImagePreview,
      };
      try {
        const productsRes = await api.get("products/");
        setProducts(productsRes.data);
      } catch {
        setProducts((prev) => [newProduct, ...prev]);
      }
      setFilterCat("All");
      setSearch("");
      setAddForm(emptyForm());
      setAddError("");
      setShowAdd(false);
      showToast(`"${res.data.name}" added to inventory.`);
    } catch {
      setAddError("Failed to add product. Please try again.");
    }
  };

  /* ── stock badge ── */
  const stockBadge = (stock) => {
    if (stock === 0)
      return <span className="stock-badge out">Out of Stock</span>;
    if (stock <= 8)
      return <span className="stock-badge low">Low: {stock}</span>;
    return <span className="stock-badge ok">{stock}</span>;
  };

  const getProductImage = (product) => {
    if (hasOwn(productImageMap, product.id)) {
      return productImageMap[product.id] || "";
    }
    if (typeof product.imagePreview === "string") return product.imagePreview;
    if (typeof product.image === "string") return product.image;
    return "";
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      const res = await api.patch("profile/", profileForm);
      setAdminProfile((prev) => ({ ...prev, ...res.data }));
      showToast("Profile settings updated.");
    } catch {
      showToast("Failed to update profile.", "warning");
    } finally {
      setProfileSaving(false);
    }
  };

  const getApiErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string") return data;
    if (data?.detail) return data.detail;
    if (data && typeof data === "object") {
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue) && firstValue.length > 0)
        return String(firstValue[0]);
      if (typeof firstValue === "string") return firstValue;
    }
    return fallback;
  };

  const handlePasswordChange = async () => {
    if (
      !passwordForm.old_password ||
      !passwordForm.new_password ||
      !passwordForm.confirm_password
    ) {
      setPasswordError("Please fill all password fields.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setPasswordSaving(true);
    setPasswordError("");
    try {
      const res = await api.post("change-password/", passwordForm);
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      showToast(res.data?.detail || "Password updated successfully.");
    } catch (error) {
      setPasswordError(getApiErrorMessage(error, "Failed to update password."));
    } finally {
      setPasswordSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = usersSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      (u.username || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query) ||
      `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase().includes(query)
    );
  });

  const topbarTitle =
    {
      dashboard: "Dashboard",
      products: "Products & Stock",
      users: "Users",
      profile: "Admin Profile Settings",
    }[tab] || "Admin";

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar__brand">
          <Link to="/" className="admin-brand-link">
            <span className="admin-brand-icon">
              <img src="/image.png" alt="Shikhar Logo" className="logo-img" />
            </span>
            <span className="admin-brand-text">SHIKHAR</span>
          </Link>
          <span className="admin-brand-badge">Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            className={`admin-nav-item${tab === "dashboard" ? " active" : ""}`}
            onClick={() => {
              setTab("dashboard");
              setSidebarOpen(false);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </button>
          <button
            className={`admin-nav-item${tab === "products" ? " active" : ""}`}
            onClick={() => {
              setTab("products");
              setSidebarOpen(false);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Products & Stock
          </button>
          <button
            className={`admin-nav-item${tab === "users" ? " active" : ""}`}
            onClick={() => {
              setTab("users");
              setSidebarOpen(false);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Users
          </button>
          <button
            className={`admin-nav-item${tab === "profile" ? " active" : ""}`}
            onClick={() => {
              setTab("profile");
              setSidebarOpen(false);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Profile Settings
          </button>
          <button className="admin-nav-item admin-nav-item--disabled">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Orders
            <span className="admin-nav-soon">Soon</span>
          </button>
          <button className="admin-nav-item admin-nav-item--disabled">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Customers
            <span className="admin-nav-soon">Soon</span>
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-sidebar-back">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <main className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="admin-topbar__title">{topbarTitle}</div>
          <div className="admin-topbar__right">
            <button
              className="admin-topbar__avatar admin-topbar__avatar-btn"
              onClick={() => setTab("profile")}
              title="Open profile settings"
            >
              {(adminProfile?.first_name || adminProfile?.username || "A")
                .charAt(0)
                .toUpperCase()}
            </button>
          </div>
        </header>

        {/* ─── Dashboard Tab ─── */}
        {tab === "dashboard" && (
          <div className="admin-content admin-dashboard">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Overview</h2>
              <p className="admin-section-sub">Live inventory snapshot</p>
            </div>

            <div className="admin-stats-grid">
              <StatCard
                delay="0ms"
                icon={
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                }
                label="Total Products"
                value={productsLoading ? "…" : totalProducts}
                sub={`${filtered.length} shown`}
                color="linear-gradient(135deg,#f59e0b,#d97706)"
              />
              <StatCard
                delay="80ms"
                icon={
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                }
                label="Low Stock"
                value={productsLoading ? "…" : lowStock}
                sub="≤ 8 units remaining"
                color="linear-gradient(135deg,#f97316,#ea580c)"
              />
              <StatCard
                delay="160ms"
                icon={
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                }
                label="Out of Stock"
                value={productsLoading ? "…" : outOfStock}
                sub="Needs restocking"
                color="linear-gradient(135deg,#ef4444,#dc2626)"
              />
              <StatCard
                delay="240ms"
                icon={
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
                label="Stock Value"
                value={
                  productsLoading
                    ? "…"
                    : `NPR ${(totalValue / 100000).toFixed(1)}L`
                }
                sub="Total inventory worth"
                color="linear-gradient(135deg,#22c55e,#16a34a)"
              />
            </div>

            {/* Quick-access panels */}
            <div className="admin-dash-panels">
              <div className="admin-dash-panel">
                <div className="admin-dash-panel__head">
                  <span className="admin-dash-panel__dot red" />
                  Out of Stock
                </div>
                {productsLoading ? (
                  <div className="admin-dash-panel__empty">Loading…</div>
                ) : products.filter((p) => p.stock === 0).length === 0 ? (
                  <div className="admin-dash-panel__empty">
                    All products are stocked ✓
                  </div>
                ) : (
                  <ul className="admin-dash-panel__list">
                    {products
                      .filter((p) => p.stock === 0)
                      .map((p) => (
                        <li key={p.id} className="admin-dash-panel__item">
                          <span className="admin-dash-panel__name">
                            {p.name}
                          </span>
                          <span className="admin-dash-panel__cat">
                            {p.category}
                          </span>
                          <button
                            className="admin-dash-panel__btn"
                            onClick={() => {
                              setTab("products");
                              setTimeout(() => startEdit(p), 100);
                            }}
                          >
                            Restock
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="admin-dash-panel">
                <div className="admin-dash-panel__head">
                  <span className="admin-dash-panel__dot orange" />
                  Low Stock (≤ 8)
                </div>
                {productsLoading ? (
                  <div className="admin-dash-panel__empty">Loading…</div>
                ) : products.filter((p) => p.stock > 0 && p.stock <= 8)
                    .length === 0 ? (
                  <div className="admin-dash-panel__empty">
                    No low-stock items ✓
                  </div>
                ) : (
                  <ul className="admin-dash-panel__list">
                    {products
                      .filter((p) => p.stock > 0 && p.stock <= 8)
                      .map((p) => (
                        <li key={p.id} className="admin-dash-panel__item">
                          <span className="admin-dash-panel__name">
                            {p.name}
                          </span>
                          <span className="admin-dash-panel__stock">
                            {p.stock} left
                          </span>
                          <button
                            className="admin-dash-panel__btn"
                            onClick={() => {
                              setTab("products");
                              setTimeout(() => startEdit(p), 100);
                            }}
                          >
                            Edit
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Products Tab ─── */}
        {tab === "products" && (
          <div className="admin-content admin-products">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Products & Stock</h2>
                <p className="admin-section-sub">
                  {products.length} total products
                </p>
              </div>
              <button
                className="admin-add-btn"
                onClick={() => {
                  setShowAdd(true);
                  setAddError("");
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Product
              </button>
            </div>

            {/* Add Product form */}
            {showAdd && (
              <div className="admin-add-form">
                <div className="admin-add-form__header">
                  <span>New Product</span>
                  <button
                    className="admin-add-form__close"
                    onClick={() => {
                      setShowAdd(false);
                      setAddError("");
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="admin-add-form__grid">
                  <div className="admin-field">
                    <label>Name *</label>
                    <input
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Product name"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Category *</label>
                    <select
                      value={addForm.category}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, category: e.target.value }))
                      }
                    >
                      <option value="">— Select —</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Section</label>
                    <select
                      value={addForm.section}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, section: e.target.value }))
                      }
                    >
                      <option value="">— Select —</option>
                      {sections.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Price (NPR) *</label>
                    <input
                      type="number"
                      value={addForm.price}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, price: e.target.value }))
                      }
                      placeholder="e.g. 12999"
                      min="0"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Stock *</label>
                    <input
                      type="number"
                      value={addForm.stock}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, stock: e.target.value }))
                      }
                      placeholder="e.g. 25"
                      min="0"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Badge</label>
                    <select
                      value={addForm.badge}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, badge: e.target.value }))
                      }
                    >
                      {badges.map((b) => (
                        <option key={b} value={b}>
                          {b || "None"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field admin-field--image">
                    <label>Product Image</label>
                    <div className="admin-image-upload">
                      <input
                        id="admin-product-image"
                        className="admin-image-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                      />
                      <label
                        className="admin-image-button"
                        htmlFor="admin-product-image"
                      >
                        Choose Image
                      </label>
                      <span className="admin-image-hint">
                        JPG, PNG, or WebP
                      </span>
                    </div>
                    {addForm.imagePreview && (
                      <div className="admin-image-preview">
                        <img
                          src={addForm.imagePreview}
                          alt={`${addForm.name || "New product"} preview`}
                        />
                        <button
                          type="button"
                          className="admin-image-preview__remove"
                          onClick={() =>
                            setAddForm((f) => ({
                              ...f,
                              imageFile: null,
                              imagePreview: "",
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {addError && <div className="admin-form-error">{addError}</div>}
                <div className="admin-add-form__actions">
                  <button
                    className="admin-btn-ghost"
                    onClick={() => {
                      setShowAdd(false);
                      setAddError("");
                      setAddForm(emptyForm());
                    }}
                  >
                    Cancel
                  </button>
                  <button className="admin-btn-primary" onClick={handleAdd}>
                    Add Product
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="admin-filters">
              <div className="admin-search-wrap">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  className="admin-search"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="admin-filter-chips">
                {["All", ...categories].map((c) => (
                  <button
                    key={c}
                    className={`admin-chip${filterCat === c ? " active" : ""}`}
                    onClick={() => setFilterCat(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="admin-filter-chips">
                {["All", "In Stock", "Low", "Out"].map((s) => (
                  <button
                    key={s}
                    className={`admin-chip admin-chip--stock${filterStock === s ? " active" : ""}`}
                    onClick={() => setFilterStock(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="admin-table-wrap">
              {productsLoading ? (
                <div className="admin-table__empty">Loading products…</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Section</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Badge</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="admin-table__empty">
                          No products match your filters.
                        </td>
                      </tr>
                    )}
                    {filtered.map((p) =>
                      editingId === p.id ? (
                        <tr key={p.id} className="admin-table__edit-row">
                          <td>
                            <div className="admin-table__edit-product-cell">
                              <div className="admin-table__edit-product-top">
                                {editRow.imagePreview ? (
                                  <img
                                    src={editRow.imagePreview}
                                    alt={`${editRow.name || "Product"} preview`}
                                    className="admin-table__thumb"
                                  />
                                ) : (
                                  <div className="admin-table__thumb admin-table__thumb--placeholder">
                                    IMG
                                  </div>
                                )}
                                <div className="admin-edit-image-upload">
                                  <input
                                    id={`admin-edit-image-${p.id}`}
                                    className="admin-image-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleEditImageSelect}
                                  />
                                  <label
                                    className="admin-image-button"
                                    htmlFor={`admin-edit-image-${p.id}`}
                                  >
                                    Change
                                  </label>
                                  {editRow.imagePreview && (
                                    <button
                                      type="button"
                                      className="admin-edit-image-remove"
                                      onClick={() =>
                                        setEditRow((row) => ({
                                          ...row,
                                          imageFile: null,
                                          imagePreview: "",
                                        }))
                                      }
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                              <input
                                className="admin-cell-input"
                                value={editRow.name}
                                onChange={(e) =>
                                  setEditRow((r) => ({
                                    ...r,
                                    name: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <select
                              className="admin-cell-select"
                              value={editRow.category || ""}
                              onChange={(e) =>
                                setEditRow((r) => ({
                                  ...r,
                                  category: e.target.value,
                                }))
                              }
                            >
                              <option value="">— Select —</option>
                              {categories.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              className="admin-cell-select"
                              value={editRow.section || ""}
                              onChange={(e) =>
                                setEditRow((r) => ({
                                  ...r,
                                  section: e.target.value,
                                }))
                              }
                            >
                              <option value="">— Select —</option>
                              {sections.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              className="admin-cell-input admin-cell-input--sm"
                              type="number"
                              value={editRow.price}
                              onChange={(e) =>
                                setEditRow((r) => ({
                                  ...r,
                                  price: e.target.value,
                                }))
                              }
                              min="0"
                            />
                          </td>
                          <td>
                            <input
                              className="admin-cell-input admin-cell-input--sm"
                              type="number"
                              value={editRow.stock}
                              onChange={(e) =>
                                setEditRow((r) => ({
                                  ...r,
                                  stock: e.target.value,
                                }))
                              }
                              min="0"
                            />
                          </td>
                          <td>
                            <select
                              className="admin-cell-select"
                              value={editRow.badge || ""}
                              onChange={(e) =>
                                setEditRow((r) => ({
                                  ...r,
                                  badge: e.target.value || null,
                                }))
                              }
                            >
                              {badges.map((b) => (
                                <option key={b} value={b}>
                                  {b || "None"}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="admin-table__actions">
                            <button
                              className="admin-action-btn admin-action-btn--save"
                              onClick={saveEdit}
                            >
                              Save
                            </button>
                            <button
                              className="admin-action-btn admin-action-btn--cancel"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={p.id} className="admin-table__row">
                          <td>
                            <div className="admin-table__product-cell">
                              {getProductImage(p) ? (
                                <img
                                  src={getProductImage(p)}
                                  alt={p.name}
                                  className="admin-table__thumb"
                                />
                              ) : (
                                <div className="admin-table__thumb admin-table__thumb--placeholder">
                                  IMG
                                </div>
                              )}
                              <span className="admin-table__name">
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="admin-cat-tag">{p.category}</span>
                          </td>
                          <td className="admin-table__section">{p.section}</td>
                          <td className="admin-table__price">
                            {formatNpr(p.price)}
                          </td>
                          <td>{stockBadge(p.stock)}</td>
                          <td>
                            {p.badge ? (
                              <span
                                className={`admin-badge-tag badge-${p.badge.toLowerCase()}`}
                              >
                                {p.badge}
                              </span>
                            ) : (
                              <span className="admin-table__none">—</span>
                            )}
                          </td>
                          <td className="admin-table__actions">
                            <button
                              className="admin-action-btn admin-action-btn--edit"
                              onClick={() => startEdit(p)}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              className="admin-action-btn admin-action-btn--delete"
                              onClick={() => confirmDelete(p.id)}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ─── Users Tab ─── */}
        {tab === "users" && (
          <div className="admin-content admin-users">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Users</h2>
                <p className="admin-section-sub">
                  Manage registered user accounts
                </p>
              </div>
            </div>

            <div className="admin-users-toolbar">
              <div className="admin-search-wrap">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  className="admin-search"
                  placeholder="Search by username, email, or name"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-wrap">
              {usersLoading ? (
                <div className="admin-table__empty">Loading users…</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="admin-table__empty">
                          No users found.
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="admin-table__row">
                        <td className="admin-table__name">{u.username}</td>
                        <td className="admin-table__section">
                          {`${u.first_name || ""} ${u.last_name || ""}`.trim() ||
                            "—"}
                        </td>
                        <td>{u.email || "—"}</td>
                        <td>
                          <span className="admin-cat-tag">
                            {u.role || "user"}
                          </span>
                        </td>
                        <td>
                          {u.is_superuser ? (
                            <span className="admin-badge-tag badge-limited">
                              Super Admin
                            </span>
                          ) : u.is_staff ? (
                            <span className="admin-badge-tag badge-new">
                              Staff
                            </span>
                          ) : (
                            <span className="admin-table__none">User</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ─── Profile Tab ─── */}
        {tab === "profile" && (
          <div className="admin-content admin-profile">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Profile Settings</h2>
                <p className="admin-section-sub">
                  Update your admin account details
                </p>
              </div>
            </div>

            <div className="admin-profile-card">
              <div className="admin-profile-avatar-lg">
                {(adminProfile?.first_name || adminProfile?.username || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="admin-profile-meta">
                <h3>{adminProfile?.username || "Admin"}</h3>
                <p>{adminProfile?.email || "No email set"}</p>
              </div>
            </div>

            <div className="admin-add-form">
              <div className="admin-add-form__header">
                <span>Admin Profile Settings</span>
              </div>
              <div className="admin-add-form__grid admin-add-form__grid--profile">
                <div className="admin-field">
                  <label>Username</label>
                  <input
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((f) => ({
                        ...f,
                        username: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>First Name</label>
                  <input
                    value={profileForm.first_name}
                    onChange={(e) =>
                      setProfileForm((f) => ({
                        ...f,
                        first_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Last Name</label>
                  <input
                    value={profileForm.last_name}
                    onChange={(e) =>
                      setProfileForm((f) => ({
                        ...f,
                        last_name: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="admin-add-form__actions">
                <button
                  className="admin-btn-primary"
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="admin-add-form admin-password-form">
              <div className="admin-add-form__header">
                <span>Change Password</span>
              </div>
              <div className="admin-add-form__grid admin-add-form__grid--profile">
                <div className="admin-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.old_password}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        old_password: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                  />
                </div>
                <div className="admin-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        new_password: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                  />
                </div>
                <div className="admin-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        confirm_password: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              {passwordError && (
                <div className="admin-form-error">{passwordError}</div>
              )}
              <div className="admin-add-form__actions">
                <button
                  className="admin-btn-primary"
                  onClick={handlePasswordChange}
                  disabled={passwordSaving}
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Delete confirm modal ── */}
      {deleteConfirm && (
        <div
          className="admin-modal-overlay"
          onClick={() => setDeleteConfirm(null)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 className="admin-modal__title">Delete Product?</h3>
            <p className="admin-modal__sub">This action cannot be undone.</p>
            <div className="admin-modal__actions">
              <button
                className="admin-btn-ghost"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button className="admin-btn-danger" onClick={doDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`admin-toast${toast.type === "warning" ? " admin-toast--warning" : ""}`}
        >
          {toast.type === "warning" ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
