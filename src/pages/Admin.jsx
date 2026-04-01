import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatNpr } from "../utils/currency";
import api from "../utils/api";
import Modal from "../components/Modal";
import { useOrders } from "../context/OrderContext";
import { useUser } from "../context/UserContext";
import { setAuth } from "../App";
import "./Admin.css";

const emptyForm = () => ({
  name:          "",
  description:   "",
  category:      "",
  section:       "",
  sub_section:   "",
  originalPrice: "",
  price:         "",
  stock:         "",
  badge:         "",
  imageFiles:    [],
  imagePreviews: [],
});

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ORDER_STATUSES = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

function formatAdminDate(dateString) {
  return new Date(dateString).toLocaleString("en-NP", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const uniqueNonEmpty = (items) => [...new Set(items.filter(Boolean))];

const buildEditableProduct = (product = {}) => ({
  localId:        `${product.id || "new"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  id:             product.id || null,
  name:           product.name || "",
  description:    product.description || "",
  category:       product.category || "",
  section:        product.section || "",
  sub_section:    product.sub_section || "",
  originalPrice:  product.original_price ?? "",
  price:          product.price ?? "",
  stock:          product.stock ?? "",
  badge:          product.badge || "",
  imageFiles:     [],
  imagePreviews:  [],
  existingImages: Array.isArray(product.images) ? product.images : [],
});

const readFilesAsDataUrls = async (files) => {
  const readFile = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror  = () => resolve("");
      reader.readAsDataURL(file);
    });
  return (await Promise.all(files.map(readFile))).filter(Boolean);
};

function getSubSectionsForSection(sectionName, allSections) {
  const found = allSections.find(
    (s) => s.name.toLowerCase() === (sectionName || "").toLowerCase()
  );
  return found?.sub_sections || [];
}

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data && typeof data === "object") {
    const first = Object.values(data)[0];
    if (Array.isArray(first) && first.length > 0) return String(first[0]);
    if (typeof first === "string") return first;
  }
  return fallback;
}

function StatCard({ icon, label, value, sub, color, delay }) {
  return (
    <div className="admin-stat-card" style={{ animationDelay: delay }}>
      <div className="admin-stat-icon" style={{ background: color }}>{icon}</div>
      <div className="admin-stat-body">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
        {sub && <div className="admin-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab]                   = useState("dashboard");
  const [products, setProducts]         = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [categories, setCategories]     = useState([]);
  const [sections, setSections]         = useState([]);
  const [badges, setBadges]             = useState([]);

  const [search, setSearch]             = useState("");
  const [filterCat, setFilterCat]       = useState("All");
  const [filterStock, setFilterStock]   = useState("All");

  const [editingProductId, setEditingProductId]   = useState(null);
  const [isEditModalOpen, setIsEditModalOpen]     = useState(false);
  const [editSaving, setEditSaving]               = useState(false);
  const [editError, setEditError]                 = useState("");
  const [editForm, setEditForm]                   = useState({
    projectDescription: "",
    subSections: [""],
    products: [],
  });
  const [originalEditProductIds, setOriginalEditProductIds] = useState([]);

  const [showAdd, setShowAdd]           = useState(false);
  const [addForm, setAddForm]           = useState(emptyForm());
  const [addError, setAddError]         = useState("");

  const [adminProfile, setAdminProfile] = useState(null);
  const [profileForm, setProfileForm]   = useState({
    username: "", first_name: "", last_name: "", email: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    old_password: "", new_password: "", confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError]   = useState("");

  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch]   = useState("");

  const [orderSearch, setOrderSearch]           = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  const [toast, setToast]               = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [adminOrders, setAdminOrders]   = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const { updateOrderStatus } = useOrders();
  const { clearUser }         = useUser();
  const navigate              = useNavigate();
  const toastTimer            = useRef(null);

  const handleAdminLogout = () => {
    setAuth(false);
    clearUser();
    navigate("/login", { replace: true });
  };

  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  // ── Image helpers ──────────────────────────────────────────
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (files.find((f) => !ACCEPTED_IMAGE_TYPES.includes(f.type))) {
      setAddError("Only JPG, PNG, or WebP images are allowed.");
      return;
    }
    readFilesAsDataUrls(files).then((previews) => {
      setAddForm((f) => ({
        ...f,
        imageFiles:    [...(f.imageFiles    || []), ...files],
        imagePreviews: [...(f.imagePreviews || []), ...previews],
      }));
      setAddError("");
    });
  };

  const handleEditProductImageSelect = (localId, event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (files.find((f) => !ACCEPTED_IMAGE_TYPES.includes(f.type))) {
      setEditError("Only JPG, PNG, or WebP images are allowed.");
      return;
    }
    readFilesAsDataUrls(files).then((previews) => {
      setEditForm((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.localId === localId
            ? {
                ...p,
                imageFiles:    [...(p.imageFiles    || []), ...files],
                imagePreviews: [...(p.imagePreviews || []), ...previews],
              }
            : p
        ),
      }));
      setEditError("");
    });
    event.target.value = "";
  };

  const removeEditProductNewImage = (localId, index) => {
    setEditForm((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.localId === localId
          ? {
              ...p,
              imageFiles:    (p.imageFiles    || []).filter((_, i) => i !== index),
              imagePreviews: (p.imagePreviews || []).filter((_, i) => i !== index),
            }
          : p
      ),
    }));
  };

  // ── Auth guard ─────────────────────────────────────────────
  useEffect(() => {
    api.get("profile/")
      .then((res) => {
        const canAccess = Boolean(
          res.data?.is_superuser || res.data?.is_staff || res.data?.role === "admin"
        );
        setAdminProfile(res.data);
        setProfileForm({
          username:   res.data?.username   || "",
          first_name: res.data?.first_name || "",
          last_name:  res.data?.last_name  || "",
          email:      res.data?.email      || "",
        });
        if (!canAccess) navigate("/");
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  // ── Load categories, sections (with subsections), badges ───
  useEffect(() => {
    Promise.all([
      api.get("categories/"),
      api.get("sections/"),
      api.get("badges/"),
    ]).then(([catRes, secRes, badRes]) => {
      setCategories(catRes.data.map((c) => c.name).filter(Boolean));
      setSections(secRes.data);
      setBadges(["", ...badRes.data.map((b) => b.name).filter(Boolean)]);
    }).catch(() => showToast("Failed to load dropdown options.", "warning"));
  }, []);

  // ── Load products ──────────────────────────────────────────
  useEffect(() => {
    api.get("products/")
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => showToast("Failed to load products.", "warning"))
      .finally(() => setProductsLoading(false));
  }, []);

  // ── Load users ─────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "users" && tab !== "analytics") return;
    setUsersLoading(true);
    api.get("users/")
      .then((res) => setUsers(res.data))
      .catch(() => showToast("Failed to load users.", "warning"))
      .finally(() => setUsersLoading(false));
  }, [tab]);

  // ── Load orders ────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "orders" && tab !== "analytics") return;
    setOrdersLoading(true);
    api.get("admin/orders/")
      .then((res) => {
        setAdminOrders(res.data.map((o) => ({
          id:                String(o.id),
          orderNumber:       o.order_number,
          statusLabel:       o.status,
          statusIndex:       o.status_index,
          subtotal:          parseFloat(o.subtotal),
          createdAt:         o.created_at,
          estimatedDelivery: o.estimated_delivery,
          userUsername:      o.user_username,
          userEmail:         o.user_email,
          items: (o.items || []).map((item) => ({
            id:       item.id,
            name:     item.name,
            category: item.category,
            price:    parseFloat(item.price),
            size:     item.size,
            quantity: item.quantity,
          })),
        })));
      })
      .catch(() => showToast("Failed to load orders.", "warning"))
      .finally(() => setOrdersLoading(false));
  }, [tab]);

  // ── Derived stats ──────────────────────────────────────────
  const totalProducts = products.length;
  const lowStock      = products.filter((p) => p.stock > 0 && p.stock <= 8).length;
  const outOfStock    = products.filter((p) => p.stock === 0).length;
  const totalValue    = products.reduce((s, p) => s + parseFloat(p.price) * p.stock, 0);

  const categoryOptions = uniqueNonEmpty(categories);
  const sectionNames    = sections.map((s) => s.name);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.section  || "").toLowerCase().includes(search.toLowerCase());
    const matchCat   = filterCat === "All" || p.category === filterCat;
    const matchStock =
      filterStock === "All" ||
      (filterStock === "In Stock" && p.stock > 8) ||
      (filterStock === "Low"      && p.stock > 0 && p.stock <= 8) ||
      (filterStock === "Out"      && p.stock === 0);
    return matchSearch && matchCat && matchStock;
  });

  // ── Edit modal helpers ─────────────────────────────────────
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProductId(null);
    setEditSaving(false);
    setEditError("");
    setOriginalEditProductIds([]);
    setEditForm({ projectDescription: "", subSections: [""], products: [] });
  };

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setEditError("");
    setOriginalEditProductIds([product.id]);
    setEditForm({
      projectDescription: product.description || "",
      subSections:        [product.sub_section || product.section || ""],
      products:           [buildEditableProduct(product)],
    });
    setIsEditModalOpen(true);
  };

  const updateEditProduct    = (localId, field, value) =>
    setEditForm((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.localId === localId ? { ...p, [field]: value } : p
      ),
    }));

  const addEditProduct    = () =>
    setEditForm((prev) => ({ ...prev, products: [...prev.products, buildEditableProduct()] }));

  const removeEditProduct = (localId) =>
    setEditForm((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.localId !== localId),
    }));

  const updateEditSubSection = (index, value) =>
    setEditForm((prev) => ({
      ...prev,
      subSections: prev.subSections.map((s, i) => i === index ? value : s),
    }));

  const addEditSubSection = () =>
    setEditForm((prev) => ({ ...prev, subSections: [...prev.subSections, ""] }));

  const removeEditSubSection = (index) =>
    setEditForm((prev) => {
      const next = prev.subSections.filter((_, i) => i !== index);
      return { ...prev, subSections: next.length > 0 ? next : [""] };
    });

  // ── Save edit ──────────────────────────────────────────────
  const saveEdit = async () => {
    const trimmedDescription = editForm.projectDescription.trim();

    if (!trimmedDescription) { setEditError("Project description is required."); return; }
    if (editForm.products.length === 0) { setEditError("Add at least one product."); return; }

    for (const product of editForm.products) {
      if (!product.name.trim())  { setEditError("Each product must have a name.");     return; }
      if (!product.category)     { setEditError("Each product must have a category."); return; }
      if (!product.section)      { setEditError("Each product must have a section.");  return; }
      const price = Number(product.price);
      const mrp   = product.originalPrice === "" || product.originalPrice === null
                      ? null : Number(product.originalPrice);
      const stock = Number(product.stock);
      if (isNaN(price) || price < 0)       { setEditError("Each product needs a valid price."); return; }
      if (mrp !== null && isNaN(mrp))       { setEditError("Original price must be a valid number."); return; }
      if (mrp !== null && price > mrp)      { setEditError("Discounted price cannot exceed original price."); return; }
      if (isNaN(stock) || stock < 0)        { setEditError("Each product needs a valid stock quantity."); return; }
    }

    setEditSaving(true);
    setEditError("");

    try {
      const currentIds = new Set(
        editForm.products.map((p) => p.id).filter((id) => id != null)
      );
      for (const id of originalEditProductIds.filter((id) => !currentIds.has(id))) {
        await api.delete(`products/${id}/`);
      }

      for (const product of editForm.products) {
        const payload = {
          name:           product.name.trim(),
          category:       product.category,
          section:        product.section,
          sub_section:    product.sub_section || null,
          badge:          product.badge || null,
          original_price: product.originalPrice === "" || product.originalPrice === null
                            ? null : Number(product.originalPrice),
          price:          Number(product.price),
          stock:          Number(product.stock),
          description:    trimmedDescription,
        };

        if (product.id) {
          await api.patch(`products/${product.id}/`, payload);
          if (product.imageFiles?.length > 0) {
            for (const img of product.existingImages || []) {
              if (img?.id) await api.delete(`products/${product.id}/images/`, { data: { image_id: img.id } });
            }
            const fd = new FormData();
            product.imageFiles.forEach((f) => fd.append("images", f));
            await api.post(`products/${product.id}/images/`, fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
        } else {
          const fd = new FormData();
          Object.entries(payload).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
          product.imageFiles?.forEach((f) => fd.append("images", f));
          await api.post("add-product/", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      setProducts((await api.get("products/")).data);
      closeEditModal();
      showToast("Product changes saved.");
    } catch (error) {
      setEditError(getApiErrorMessage(error, "Failed to save product changes."));
    } finally {
      setEditSaving(false);
    }
  };

  // ── Add product ────────────────────────────────────────────
  const handleAdd = async () => {
    if (!addForm.name.trim())                              { setAddError("Product name is required.");  return; }
    if (!addForm.price || isNaN(Number(addForm.price)))   { setAddError("Enter a valid price.");        return; }
    if (!addForm.category)                                 { setAddError("Please select a category.");  return; }
    if (!addForm.section)                                  { setAddError("Please select a section.");   return; }
    if (addForm.stock === "" || isNaN(Number(addForm.stock))) { setAddError("Enter a valid stock.");    return; }
    if (!addForm.description.trim())                       { setAddError("Description is required.");   return; }

    try {
      const fd = new FormData();
      fd.append("name",        addForm.name.trim());
      fd.append("description", addForm.description.trim());
      fd.append("category",    addForm.category);
      fd.append("section",     addForm.section);
      fd.append("price",       Number(addForm.price));
      fd.append("stock",       Number(addForm.stock));
      if (addForm.sub_section) fd.append("sub_section", addForm.sub_section);
      if (addForm.badge)       fd.append("badge",       addForm.badge);
      (addForm.imageFiles || []).forEach((f) => fd.append("images", f));

      await api.post("add-product/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setProducts((await api.get("products/")).data);
      setAddForm(emptyForm());
      setAddError("");
      setShowAdd(false);
      showToast(`"${addForm.name}" added to inventory.`);
    } catch (err) {
      setAddError(getApiErrorMessage(err, "Failed to add product."));
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const confirmDelete = (id) => setDeleteConfirm(id);
  const doDelete = async () => {
    try {
      await api.delete(`products/${deleteConfirm}/`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm));
      setDeleteConfirm(null);
      showToast("Product deleted.", "warning");
    } catch {
      showToast("Failed to delete product.", "warning");
      setDeleteConfirm(null);
    }
  };

  // ── Profile / Password ─────────────────────────────────────
  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      const res = await api.patch("profile/", profileForm);
      setAdminProfile((prev) => ({ ...prev, ...res.data }));
      setProfileForm({
        username:   res.data.username   || "",
        first_name: res.data.first_name || "",
        last_name:  res.data.last_name  || "",
        email:      res.data.email      || "",
      });
      showToast("Profile updated successfully.");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Failed to update profile."), "warning");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setPasswordError("Please fill all password fields."); return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Passwords do not match."); return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    try {
      const res = await api.post("change-password/", passwordForm);
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
      showToast(res.data?.detail || "Password updated successfully.");
    } catch (error) {
      setPasswordError(getApiErrorMessage(error, "Failed to update password."));
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Orders ─────────────────────────────────────────────────
  const handleAdminOrderStatusChange = async (order, event) => {
    const nextStatus = event.target.value;
    const nextIndex  = ORDER_STATUSES.indexOf(nextStatus);
    if (nextIndex < 0) return;
    try {
      await api.patch(`admin/orders/${order.id}/`, { status: nextStatus });
      setAdminOrders((prev) =>
        prev.map((o) =>
          String(o.id) === String(order.id)
            ? { ...o, statusLabel: nextStatus, statusIndex: nextIndex }
            : o
        )
      );
      showToast(`Order ${order.orderNumber} updated to ${nextStatus}.`);
    } catch {
      showToast("Failed to update order status.", "warning");
    }
  };

  // ── Derived lists ──────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const q = usersSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.username   || "").toLowerCase().includes(q) ||
      (u.email      || "").toLowerCase().includes(q) ||
      `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase().includes(q)
    );
  });

  const customerUsers      = users.filter((u) => !(u.is_superuser || u.is_staff || u.role === "admin"));
  const sortedAdminOrders  = [...adminOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredOrders     = sortedAdminOrders.filter((order) => {
    const q = orderSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      (order.orderNumber || "").toLowerCase().includes(q) ||
      String(order.id).toLowerCase().includes(q) ||
      order.items?.some((item) => (item.name || "").toLowerCase().includes(q));
    const matchStatus = orderStatusFilter === "All" || order.statusLabel === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  // ── Analytics ──────────────────────────────────────────────
  const totalOrdersCount   = sortedAdminOrders.length;
  const totalRevenue       = sortedAdminOrders.reduce((s, o) => s + Number(o.subtotal || 0), 0);
  const avgOrderValue      = totalOrdersCount ? totalRevenue / totalOrdersCount : 0;
  const deliveredOrders    = sortedAdminOrders.filter((o) => o.statusLabel === "Delivered").length;
  const recentOrders       = sortedAdminOrders.filter(
    (o) => new Date(o.createdAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;
  const ordersByStatus     = ORDER_STATUSES.map((status) => {
    const count = sortedAdminOrders.filter((o) => o.statusLabel === status).length;
    return { status, count, pct: totalOrdersCount ? Math.round((count / totalOrdersCount) * 100) : 0 };
  });
  const topOrderedProducts = Object.entries(
    sortedAdminOrders.reduce((acc, order) => {
      (order.items || []).forEach((item) => {
        acc[item.name || "Unknown"] = (acc[item.name || "Unknown"] || 0) + Number(item.quantity || 1);
      });
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // ── Helpers ────────────────────────────────────────────────
  const stockBadge = (stock) => {
    if (stock === 0)    return <span className="stock-badge out">Out of Stock</span>;
    if (stock <= 8)     return <span className="stock-badge low">Low: {stock}</span>;
    return <span className="stock-badge ok">{stock}</span>;
  };

  const getProductImage = (product) => {
    if (product?.images?.length > 0) {
      const primary = product.images.find((img) => img?.is_primary);
      return (primary || product.images[0])?.image || "";
    }
    return typeof product?.image === "string" ? product.image : "";
  };

  const topbarTitle = {
    dashboard: "Dashboard",
    products:  "Products & Stock",
    orders:    "Orders",
    analytics: "Analytics",
    users:     "Users",
    profile:   "Admin Profile Settings",
  }[tab] || "Admin";

  // ── Sidebar nav items ──────────────────────────────────────
  const sidebarNavItems = [
    {
      key: "dashboard", label: "Dashboard",
      icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    },
    {
      key: "products", label: "Products & Stock",
      icon: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    },
    {
      key: "orders", label: "Orders",
      icon: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M9 14h6"/><path d="M9 10h6"/></>,
    },
    {
      key: "analytics", label: "Analytics",
      icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    },
    {
      key: "users", label: "Users",
      icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    },
    {
      key: "profile", label: "Profile Settings",
      icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    },
  ];

  return (
    <div className="admin-layout">

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar__brand">
          <Link to="/" className="admin-brand-link">
            <span className="admin-brand-icon">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <polygon points="14,2 26,24 2,24" fill="currentColor" opacity="0.9"/>
                <polygon points="14,8 21,24 7,24" fill="white" opacity="0.3"/>
              </svg>
            </span>
            <span className="admin-brand-text">SHIKHAR</span>
          </Link>
          <span className="admin-brand-badge">Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          {sidebarNavItems.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`admin-nav-item${tab === key ? " active" : ""}`}
              onClick={() => { setTab(key); setSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {icon}
              </svg>
              {label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-sidebar-back">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Store
          </Link>
          <button type="button" className="admin-sidebar-logout" onClick={handleAdminLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout Admin
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)}/>}

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <span/><span/><span/>
          </button>
          <div className="admin-topbar__title">{topbarTitle}</div>
          <div className="admin-topbar__right">
            <button type="button" className="admin-topbar__logout" onClick={handleAdminLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
            <button className="admin-topbar__avatar admin-topbar__avatar-btn"
              onClick={() => setTab("profile")} title="Open profile settings">
              {(adminProfile?.first_name || adminProfile?.username || "A").charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {/* ─── Dashboard ──────────────────────────────────── */}
        {tab === "dashboard" && (
          <div className="admin-content admin-dashboard">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Overview</h2>
              <p className="admin-section-sub">Live inventory snapshot</p>
            </div>
            <div className="admin-stats-grid">
              <StatCard delay="0ms"
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
                label="Total Products" value={productsLoading ? "…" : totalProducts}
                sub={`${filtered.length} shown`} color="linear-gradient(135deg,#f59e0b,#d97706)"/>
              <StatCard delay="80ms"
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                label="Low Stock" value={productsLoading ? "…" : lowStock}
                sub="≤ 8 units remaining" color="linear-gradient(135deg,#f97316,#ea580c)"/>
              <StatCard delay="160ms"
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                label="Out of Stock" value={productsLoading ? "…" : outOfStock}
                sub="Needs restocking" color="linear-gradient(135deg,#ef4444,#dc2626)"/>
              <StatCard delay="240ms"
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                label="Stock Value"
                value={productsLoading ? "…" : `NPR ${(totalValue / 100000).toFixed(1)}L`}
                sub="Total inventory worth" color="linear-gradient(135deg,#22c55e,#16a34a)"/>
            </div>
            <div className="admin-dash-panels">
              <div className="admin-dash-panel">
                <div className="admin-dash-panel__head"><span className="admin-dash-panel__dot red"/>Out of Stock</div>
                {productsLoading ? <div className="admin-dash-panel__empty">Loading…</div>
                  : products.filter((p) => p.stock === 0).length === 0
                  ? <div className="admin-dash-panel__empty">All products are stocked ✓</div>
                  : <ul className="admin-dash-panel__list">
                      {products.filter((p) => p.stock === 0).map((p) => (
                        <li key={p.id} className="admin-dash-panel__item">
                          <span className="admin-dash-panel__name">{p.name}</span>
                          <span className="admin-dash-panel__cat">{p.category}</span>
                          <button className="admin-dash-panel__btn"
                            onClick={() => { setTab("products"); setTimeout(() => startEdit(p), 100); }}>
                            Restock
                          </button>
                        </li>
                      ))}
                    </ul>}
              </div>
              <div className="admin-dash-panel">
                <div className="admin-dash-panel__head"><span className="admin-dash-panel__dot orange"/>Low Stock (≤ 8)</div>
                {productsLoading ? <div className="admin-dash-panel__empty">Loading…</div>
                  : products.filter((p) => p.stock > 0 && p.stock <= 8).length === 0
                  ? <div className="admin-dash-panel__empty">No low-stock items ✓</div>
                  : <ul className="admin-dash-panel__list">
                      {products.filter((p) => p.stock > 0 && p.stock <= 8).map((p) => (
                        <li key={p.id} className="admin-dash-panel__item">
                          <span className="admin-dash-panel__name">{p.name}</span>
                          <span className="admin-dash-panel__stock">{p.stock} left</span>
                          <button className="admin-dash-panel__btn"
                            onClick={() => { setTab("products"); setTimeout(() => startEdit(p), 100); }}>
                            Edit
                          </button>
                        </li>
                      ))}
                    </ul>}
              </div>
            </div>
          </div>
        )}

        {/* ─── Products ───────────────────────────────────── */}
        {tab === "products" && (
          <div className="admin-content admin-products">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Products & Stock</h2>
                <p className="admin-section-sub">{products.length} total products</p>
              </div>
              <button className="admin-add-btn" onClick={() => { setShowAdd(true); setAddError(""); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Product
              </button>
            </div>

            {/* ── Add form ── */}
            {showAdd && (
              <div className="admin-add-form">
                <div className="admin-add-form__header">
                  <span>New Product</span>
                  <button className="admin-add-form__close"
                    onClick={() => { setShowAdd(false); setAddError(""); setAddForm(emptyForm()); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div className="admin-add-form__grid">
                  <div className="admin-field">
                    <label>Name *</label>
                    <input value={addForm.name} placeholder="Product name"
                      onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}/>
                  </div>
                  <div className="admin-field admin-field--description">
                    <label>Description *</label>
                    <textarea rows={3} value={addForm.description}
                      placeholder="Write a short product description"
                      onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}/>
                  </div>
                  <div className="admin-field">
                    <label>Category *</label>
                    <select value={addForm.category}
                      onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}>
                      <option value="">— Select —</option>
                      {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Section *</label>
                    <select value={addForm.section}
                      onChange={(e) => setAddForm((f) => ({ ...f, section: e.target.value, sub_section: "" }))}>
                      <option value="">— Select —</option>
                      {sectionNames.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {getSubSectionsForSection(addForm.section, sections).length > 0 && (
                    <div className="admin-field">
                      <label>Sub-section</label>
                      <select value={addForm.sub_section}
                        onChange={(e) => setAddForm((f) => ({ ...f, sub_section: e.target.value }))}>
                        <option value="">— None —</option>
                        {getSubSectionsForSection(addForm.section, sections).map((sub) => (
                          <option key={sub.id} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="admin-field">
                    <label>Original Price (NPR)</label>
                    <input type="number" min="0" value={addForm.originalPrice}
                      placeholder="e.g. 15999"
                      onChange={(e) => setAddForm((f) => ({ ...f, originalPrice: e.target.value }))}/>
                  </div>
                  <div className="admin-field">
                    <label>Price (NPR) *</label>
                    <input type="number" min="0" value={addForm.price}
                      placeholder="e.g. 12999"
                      onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}/>
                  </div>
                  <div className="admin-field">
                    <label>Stock *</label>
                    <input type="number" min="0" value={addForm.stock}
                      placeholder="e.g. 25"
                      onChange={(e) => setAddForm((f) => ({ ...f, stock: e.target.value }))}/>
                  </div>
                  <div className="admin-field">
                    <label>Badge</label>
                    <select value={addForm.badge}
                      onChange={(e) => setAddForm((f) => ({ ...f, badge: e.target.value }))}>
                      {badges.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
                    </select>
                  </div>
                  <div className="admin-field admin-field--image">
                    <label>Product Images</label>
                    <div className="admin-image-upload">
                      <input id="admin-product-image" className="admin-image-input"
                        type="file" accept="image/jpeg,image/png,image/webp"
                        multiple onChange={handleImageSelect}/>
                      <label className="admin-image-button" htmlFor="admin-product-image">Choose Images</label>
                      <span className="admin-image-hint">JPG, PNG, or WebP — select multiple</span>
                    </div>
                    {addForm.imagePreviews?.length > 0 && (
                      <div className="admin-image-previews">
                        {addForm.imagePreviews.map((src, i) => (
                          <div key={i} className="admin-image-preview">
                            <img src={src} alt={`Preview ${i + 1}`}/>
                            <button type="button" className="admin-image-preview__remove"
                              onClick={() => setAddForm((f) => ({
                                ...f,
                                imageFiles:    f.imageFiles.filter((_, idx) => idx !== i),
                                imagePreviews: f.imagePreviews.filter((_, idx) => idx !== i),
                              }))}>
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {addError && <div className="admin-form-error">{addError}</div>}
                <div className="admin-add-form__actions">
                  <button className="admin-btn-ghost"
                    onClick={() => { setShowAdd(false); setAddError(""); setAddForm(emptyForm()); }}>
                    Cancel
                  </button>
                  <button className="admin-btn-primary" onClick={handleAdd}>Add Product</button>
                </div>
              </div>
            )}

            {/* ── Filters ── */}
            <div className="admin-filters">
              <div className="admin-search-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input className="admin-search" placeholder="Search products…"
                  value={search} onChange={(e) => setSearch(e.target.value)}/>
              </div>
              <div className="admin-filter-chips">
                {["All", ...categoryOptions].map((c) => (
                  <button key={c} className={`admin-chip${filterCat === c ? " active" : ""}`}
                    onClick={() => setFilterCat(c)}>{c}</button>
                ))}
              </div>
              <div className="admin-filter-chips">
                {["All", "In Stock", "Low", "Out"].map((s) => (
                  <button key={s} className={`admin-chip admin-chip--stock${filterStock === s ? " active" : ""}`}
                    onClick={() => setFilterStock(s)}>{s}</button>
                ))}
              </div>
            </div>

            {/* ── Table ── */}
            <div className="admin-table-wrap">
              {productsLoading ? (
                <div className="admin-table__empty">Loading products…</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th><th>Category</th><th>Section</th>
                      <th>Sub-section</th><th>Price</th><th>Stock</th>
                      <th>Badge</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} className="admin-table__empty">No products match your filters.</td></tr>
                    )}
                    {filtered.map((p) => (
                      <tr key={p.id}
                        className={`admin-table__row${editingProductId === p.id && isEditModalOpen ? " admin-table__row--editing" : ""}`}>
                        <td>
                          <div className="admin-table__product-cell">
                            {getProductImage(p)
                              ? <img src={getProductImage(p)} alt={p.name} className="admin-table__thumb"/>
                              : <div className="admin-table__thumb admin-table__thumb--placeholder">IMG</div>}
                            <span className="admin-table__name">{p.name}</span>
                          </div>
                        </td>
                        <td><span className="admin-cat-tag">{p.category}</span></td>
                        <td className="admin-table__section">{p.section}</td>
                        <td className="admin-table__section">{p.sub_section || <span className="admin-table__none">—</span>}</td>
                        <td className="admin-table__price">{formatNpr(p.price)}</td>
                        <td>{stockBadge(p.stock)}</td>
                        <td>
                          {p.badge
                            ? <span className={`admin-badge-tag badge-${p.badge.toLowerCase()}`}>{p.badge}</span>
                            : <span className="admin-table__none">—</span>}
                        </td>
                        <td className="admin-table__actions">
                          <button className="admin-action-btn admin-action-btn--edit" onClick={() => startEdit(p)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                          <button className="admin-action-btn admin-action-btn--delete" onClick={() => confirmDelete(p.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ─── Orders ─────────────────────────────────────── */}
        {tab === "orders" && (
          <div className="admin-content admin-orders">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Orders</h2>
                <p className="admin-section-sub">Track customer orders and update delivery progress</p>
              </div>
            </div>
            <div className="admin-filters admin-orders__filters">
              <div className="admin-search-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input className="admin-search" placeholder="Search by order id or product"
                  value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}/>
              </div>
              <div className="admin-filter-chips">
                {["All", ...ORDER_STATUSES].map((s) => (
                  <button key={s} className={`admin-chip${orderStatusFilter === s ? " active" : ""}`}
                    onClick={() => setOrderStatusFilter(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div className="admin-table-wrap">
              {ordersLoading ? <div className="admin-table__empty">Loading orders…</div> : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th><th>Customer</th><th>Placed</th>
                      <th>Items</th><th>Total</th><th>Status</th><th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={7} className="admin-table__empty">No orders found.</td></tr>
                    )}
                    {filteredOrders.map((order) => {
                      const currentStatus = ORDER_STATUSES.includes(order.statusLabel)
                        ? order.statusLabel : "Confirmed";
                      const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                      return (
                        <tr key={order.id} className="admin-table__row">
                          <td>
                            <div className="admin-order-id">{order.orderNumber}</div>
                            <div className="admin-order-subid">Ref: {order.id}</div>
                          </td>
                          <td className="admin-table__section">
                            <div>{order.userUsername || "—"}</div>
                            <div style={{ fontSize: "11px", opacity: 0.6 }}>{order.userEmail || ""}</div>
                          </td>
                          <td className="admin-table__section">{formatAdminDate(order.createdAt)}</td>
                          <td className="admin-table__section">{itemCount} item{itemCount === 1 ? "" : "s"}</td>
                          <td className="admin-table__price">{formatNpr(order.subtotal || 0)}</td>
                          <td><span className="admin-badge-tag badge-new">{currentStatus}</span></td>
                          <td>
                            <select className="admin-cell-select admin-order-status-select"
                              value={currentStatus}
                              onChange={(e) => handleAdminOrderStatusChange(order, e)}>
                              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ─── Analytics ──────────────────────────────────── */}
        {tab === "analytics" && (
          <div className="admin-content admin-analytics">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Analytics</h2>
                <p className="admin-section-sub">Quick business insights from orders, customers, and inventory</p>
              </div>
            </div>
            <div className="admin-analytics-grid">
              <StatCard delay="0ms"
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M19 9 13 15l-4-4-3 3"/></svg>}
                label="Revenue" value={formatNpr(totalRevenue)}
                sub={`${recentOrders} orders in last 7 days`} color="linear-gradient(135deg,#22c55e,#16a34a)"/>
              <StatCard delay="70ms"
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
                label="Total Orders" value={totalOrdersCount}
                sub={`${deliveredOrders} delivered`} color="linear-gradient(135deg,#0ea5e9,#0284c7)"/>
              <StatCard delay="140ms"
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                label="Avg Order Value" value={formatNpr(avgOrderValue)}
                sub="Average ticket size" color="linear-gradient(135deg,#f59e0b,#d97706)"/>
              <StatCard delay="210ms"
                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                label="Customers" value={customerUsers.length}
                sub="Non-admin accounts" color="linear-gradient(135deg,#a855f7,#7e22ce)"/>
            </div>
            <div className="admin-analytics-panels">
              <div className="admin-dash-panel">
                <div className="admin-dash-panel__head"><span className="admin-dash-panel__dot orange"/>Orders by Status</div>
                {totalOrdersCount === 0
                  ? <div className="admin-dash-panel__empty">No orders available yet.</div>
                  : <div className="admin-analytics-status-list">
                      {ordersByStatus.map((entry) => (
                        <div key={entry.status} className="admin-analytics-status-item">
                          <div className="admin-analytics-status-top">
                            <span>{entry.status}</span>
                            <span>{entry.count} ({entry.pct}%)</span>
                          </div>
                          <div className="admin-analytics-progress">
                            <div className="admin-analytics-progress__fill" style={{ width: `${entry.pct}%` }}/>
                          </div>
                        </div>
                      ))}
                    </div>}
              </div>
              <div className="admin-dash-panel">
                <div className="admin-dash-panel__head"><span className="admin-dash-panel__dot red"/>Top Ordered Products</div>
                {topOrderedProducts.length === 0
                  ? <div className="admin-dash-panel__empty">Place orders to view product demand trends.</div>
                  : <ul className="admin-dash-panel__list">
                      {topOrderedProducts.map(([name, qty]) => (
                        <li key={name} className="admin-dash-panel__item">
                          <span className="admin-dash-panel__name">{name}</span>
                          <span className="admin-dash-panel__stock">{qty} unit{qty === 1 ? "" : "s"}</span>
                        </li>
                      ))}
                    </ul>}
              </div>
            </div>
          </div>
        )}

        {/* ─── Users ──────────────────────────────────────── */}
        {tab === "users" && (
          <div className="admin-content admin-users">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Users</h2>
                <p className="admin-section-sub">Manage registered user accounts</p>
              </div>
            </div>
            <div className="admin-users-toolbar">
              <div className="admin-search-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input className="admin-search" placeholder="Search by username, email, or name"
                  value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)}/>
              </div>
            </div>
            <div className="admin-table-wrap">
              {usersLoading ? <div className="admin-table__empty">Loading users…</div> : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Username</th><th>Name</th><th>Email</th><th>Role</th><th>Access</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="admin-table__empty">No users found.</td></tr>
                    )}
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="admin-table__row">
                        <td className="admin-table__name">{u.username}</td>
                        <td className="admin-table__section">
                          {`${u.first_name || ""} ${u.last_name || ""}`.trim() || "—"}
                        </td>
                        <td>{u.email || "—"}</td>
                        <td><span className="admin-cat-tag">{u.role || "user"}</span></td>
                        <td>
                          {u.is_superuser
                            ? <span className="admin-badge-tag badge-limited">Super Admin</span>
                            : u.is_staff
                            ? <span className="admin-badge-tag badge-new">Staff</span>
                            : <span className="admin-table__none">User</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ─── Profile ────────────────────────────────────── */}
        {tab === "profile" && (
          <div className="admin-content admin-profile">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Profile Settings</h2>
                <p className="admin-section-sub">Update your admin account details</p>
              </div>
            </div>
            <div className="admin-profile-card">
              <div className="admin-profile-avatar-lg">
                {(adminProfile?.first_name || adminProfile?.username || "A").charAt(0).toUpperCase()}
              </div>
              <div className="admin-profile-meta">
                <h3>{adminProfile?.username || "Admin"}</h3>
                <p>{adminProfile?.email || "No email set"}</p>
              </div>
            </div>
            <div className="admin-add-form">
              <div className="admin-add-form__header"><span>Admin Profile Settings</span></div>
              <div className="admin-add-form__grid admin-add-form__grid--profile">
                <div className="admin-field">
                  <label>Username</label>
                  <input value={profileForm.username}
                    onChange={(e) => setProfileForm((f) => ({ ...f, username: e.target.value }))}/>
                </div>
                <div className="admin-field">
                  <label>Email</label>
                  <input type="email" value={profileForm.email}
                    onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}/>
                </div>
                <div className="admin-field">
                  <label>First Name</label>
                  <input value={profileForm.first_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))}/>
                </div>
                <div className="admin-field">
                  <label>Last Name</label>
                  <input value={profileForm.last_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))}/>
                </div>
              </div>
              <div className="admin-add-form__actions">
                <button className="admin-btn-primary" onClick={handleProfileSave} disabled={profileSaving}>
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
            <div className="admin-add-form admin-password-form">
              <div className="admin-add-form__header"><span>Change Password</span></div>
              <div className="admin-add-form__grid admin-add-form__grid--profile">
                <div className="admin-field">
                  <label>Current Password</label>
                  <input type="password" value={passwordForm.old_password}
                    placeholder="Enter current password"
                    onChange={(e) => setPasswordForm((f) => ({ ...f, old_password: e.target.value }))}/>
                </div>
                <div className="admin-field">
                  <label>New Password</label>
                  <input type="password" value={passwordForm.new_password}
                    placeholder="Enter new password"
                    onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}/>
                </div>
                <div className="admin-field">
                  <label>Confirm New Password</label>
                  <input type="password" value={passwordForm.confirm_password}
                    placeholder="Confirm new password"
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}/>
                </div>
              </div>
              {passwordError && <div className="admin-form-error">{passwordError}</div>}
              <div className="admin-add-form__actions">
                <button className="admin-btn-primary" onClick={handlePasswordChange} disabled={passwordSaving}>
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Edit Modal ──────────────────────────────────────── */}
      <Modal isOpen={isEditModalOpen} title="Edit Product" onClose={closeEditModal}
        maxWidth={980} scrollable
        actions={
          <>
            <button className="admin-btn-ghost" onClick={closeEditModal}>Cancel</button>
            <button className="admin-btn-primary" onClick={saveEdit} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save Changes"}
            </button>
          </>
        }>
        <div className="admin-edit-modal">
          <div className="admin-edit-modal__group">
            <div className="admin-field">
              <label>Product Description *</label>
              <textarea className="admin-textarea" rows={4}
                value={editForm.projectDescription}
                placeholder="Describe this product."
                onChange={(e) => setEditForm((prev) => ({ ...prev, projectDescription: e.target.value }))}/>
            </div>
          </div>

          <div className="admin-edit-modal__group">
            <div className="admin-edit-modal__heading-row">
              <h4 className="admin-edit-modal__heading">Products</h4>
              <button className="admin-action-btn admin-action-btn--edit" type="button" onClick={addEditProduct}>
                + Add Product
              </button>
            </div>
            <div className="admin-edit-products">
              {editForm.products.map((product, index) => (
                <div key={product.localId} className="admin-edit-product-card">
                  <div className="admin-edit-product-card__head">
                    <span>Product {index + 1}</span>
                    <button type="button" className="admin-action-btn admin-action-btn--delete"
                      onClick={() => removeEditProduct(product.localId)}
                      disabled={editForm.products.length === 1}>
                      Remove
                    </button>
                  </div>
                  <div className="admin-add-form__grid admin-add-form__grid--edit-modal">
                    <div className="admin-field">
                      <label>Name *</label>
                      <input value={product.name} placeholder="Product name"
                        onChange={(e) => updateEditProduct(product.localId, "name", e.target.value)}/>
                    </div>
                    <div className="admin-field">
                      <label>Category *</label>
                      <select value={product.category}
                        onChange={(e) => updateEditProduct(product.localId, "category", e.target.value)}>
                        <option value="">— Select —</option>
                        {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="admin-field">
                      <label>Section *</label>
                      <select value={product.section}
                        onChange={(e) => {
                          updateEditProduct(product.localId, "section",     e.target.value);
                          updateEditProduct(product.localId, "sub_section", "");
                        }}>
                        <option value="">— Select —</option>
                        {sectionNames.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {getSubSectionsForSection(product.section, sections).length > 0 && (
                      <div className="admin-field">
                        <label>Sub-section</label>
                        <select value={product.sub_section || ""}
                          onChange={(e) => updateEditProduct(product.localId, "sub_section", e.target.value)}>
                          <option value="">— None —</option>
                          {getSubSectionsForSection(product.section, sections).map((sub) => (
                            <option key={sub.id} value={sub.name}>{sub.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="admin-field">
                      <label>Original Price (NPR)</label>
                      <input type="number" min="0" value={product.originalPrice} placeholder="e.g. 15999"
                        onChange={(e) => updateEditProduct(product.localId, "originalPrice", e.target.value)}/>
                    </div>
                    <div className="admin-field">
                      <label>Discounted Price (NPR) *</label>
                      <input type="number" min="0" value={product.price} placeholder="e.g. 12999"
                        onChange={(e) => updateEditProduct(product.localId, "price", e.target.value)}/>
                    </div>
                    <div className="admin-field">
                      <label>Stock *</label>
                      <input type="number" min="0" value={product.stock} placeholder="e.g. 10"
                        onChange={(e) => updateEditProduct(product.localId, "stock", e.target.value)}/>
                    </div>
                    <div className="admin-field">
                      <label>Badge</label>
                      <select value={product.badge || ""}
                        onChange={(e) => updateEditProduct(product.localId, "badge", e.target.value)}>
                        {badges.map((b) => <option key={b || "none"} value={b}>{b || "None"}</option>)}
                      </select>
                    </div>
                    <div className="admin-field admin-field--image">
                      <label>Product Images</label>
                      <div className="admin-image-upload">
                        <input id={`admin-edit-image-${product.localId}`} className="admin-image-input"
                          type="file" accept="image/jpeg,image/png,image/webp" multiple
                          onChange={(e) => handleEditProductImageSelect(product.localId, e)}/>
                        <label className="admin-image-button" htmlFor={`admin-edit-image-${product.localId}`}>
                          Choose Images
                        </label>
                        <span className="admin-image-hint">Selecting new files replaces existing images on save</span>
                      </div>
                      {product.existingImages?.length > 0 && !product.imagePreviews?.length && (
                        <div className="admin-image-previews">
                          {product.existingImages.map((img) => (
                            <div key={img.id || img.image} className="admin-image-preview">
                              <img src={img.image} alt="Existing product"/>
                            </div>
                          ))}
                        </div>
                      )}
                      {product.imagePreviews?.length > 0 && (
                        <div className="admin-image-previews">
                          {product.imagePreviews.map((src, i) => (
                            <div key={`${product.localId}-${i}`} className="admin-image-preview">
                              <img src={src} alt={`New preview ${i + 1}`}/>
                              <button type="button" className="admin-image-preview__remove"
                                onClick={() => removeEditProductNewImage(product.localId, i)}>
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {editError && <div className="admin-form-error">{editError}</div>}
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ───────────────────────────── */}
      {deleteConfirm && (
        <Modal isOpen={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} maxWidth={360}
          actions={
            <>
              <button className="admin-btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="admin-btn-danger" onClick={doDelete}>Yes, Delete</button>
            </>
          }>
          <div className="admin-delete-confirm">
            <div className="admin-modal__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3 className="admin-modal__title">Delete Product?</h3>
            <p className="admin-modal__sub">This action cannot be undone.</p>
          </div>
        </Modal>
      )}

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div className={`admin-toast${toast.type === "warning" ? " admin-toast--warning" : ""}`}>
          {toast.type === "warning"
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}