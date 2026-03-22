// src\utils\normaliseProduct.js

const GRADIENTS = [
  "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
  "linear-gradient(135deg, #744210 0%, #92400e 100%)",
  "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
  "linear-gradient(135deg, #1B4332 0%, #065f46 100%)",
  "linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 100%)",
  "linear-gradient(135deg, #374151 0%, #111827 100%)",
  "linear-gradient(135deg, #92400e 0%, #D97706 100%)",
  "linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%)",
  "linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)",
  "linear-gradient(135deg, #064e3b 0%, #1B4332 100%)",
  "linear-gradient(135deg, #0d2b1e 0%, #2d3748 100%)",
];

/**
 * Convert a raw API product into the shape ProductCard expects.
 * Works for any section/category filter combination.
 *
 * @param {object} p     - raw product from API
 * @param {number} index - position in array (used to pick a fallback gradient)
 * @returns {object}
 */
export function normaliseProduct(p, index) {
  const primaryImage =
    p.images && Array.isArray(p.images) && p.images.length > 0
      ? (p.images.find((img) => img && img.is_primary) || p.images[0]).image
      : null;

  return {
    ...p,
    price: parseFloat(p.price),
    originalPrice: p.original_price ? parseFloat(p.original_price) : null,
    badge: p.badge || null,
    // image is read by ProductCard directly
    image: primaryImage || null,
    // gradient is used as fallback when no image exists
    gradient: primaryImage ? null : GRADIENTS[index % GRADIENTS.length],
  };
}

/**
 * Fetch all products from the API filtered by one or more category names.
 * Returns normalised products + unique section names for filter chips.
 *
 * @param {string[]} categoryNames  e.g. ["men's", "unisex"]
 * @param {object}   api            the axios api instance
 * @returns {Promise<{ products: object[], sections: string[] }>}
 */
export async function fetchProductsByCategory(categoryNames, api) {
  const res = await api.get("products/");
  const lower = categoryNames.map((c) => c.toLowerCase());

  const products = res.data
    .filter((p) => lower.includes((p.category || "").toLowerCase()))
    .map((p, i) => normaliseProduct(p, i));

  const sections = [...new Set(products.map((p) => p.section).filter(Boolean))];

  return { products, sections };
}

/**
 * Fetch ALL products (no category filter) normalised.
 * Used by pages like Goretex, Footwear, Equipment, Bottles, Backpacks
 * where every product in that section belongs to this page regardless of gender.
 *
 * @param {string}   sectionName  e.g. "goretex" — pass null to get everything
 * @param {object}   api
 * @returns {Promise<{ products: object[], sections: string[] }>}
 */
export async function fetchProductsBySection(sectionName, api) {
  const res = await api.get("products/");

  const products = res.data
    .filter((p) =>
      sectionName
        ? (p.section || "").toLowerCase() === sectionName.toLowerCase()
        : true,
    )
    .map((p, i) => normaliseProduct(p, i));

  // For section pages the "sub-filter" chips come from the category field
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return { products, categories };
}