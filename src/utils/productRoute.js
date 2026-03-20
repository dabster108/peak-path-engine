const PRODUCT_CACHE_KEY = "shikhar_product_cache_v1";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProductHandle(product) {
  const idPart = product?.id != null ? String(product.id) : "item";
  const namePart = slugify(product?.name || "product");
  const categoryPart = slugify(product?.category || "general");
  const pricePart = Number(product?.price || 0);
  return `${idPart}-${namePart}-${categoryPart}-${pricePart}`;
}

export function getProductRoute(product) {
  return `/product/${getProductHandle(product)}`;
}

function readCache() {
  try {
    const raw = localStorage.getItem(PRODUCT_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(cache));
}

export function cacheProductForDetails(product) {
  if (!product || !product.name) return;

  const handle = getProductHandle(product);
  const cache = readCache();
  cache[handle] = {
    ...product,
    __cachedAt: Date.now(),
  };

  const entries = Object.entries(cache)
    .sort((a, b) => (b[1]?.__cachedAt || 0) - (a[1]?.__cachedAt || 0))
    .slice(0, 400);

  writeCache(Object.fromEntries(entries));
}

export function getCachedProductByHandle(handle) {
  if (!handle) return null;
  const cache = readCache();
  return cache[handle] || null;
}
