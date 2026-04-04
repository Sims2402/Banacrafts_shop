import type { Product, ProductDiscount } from "@/data/products";

/** Badge text for product cards / detail (promo code when set, else % / fixed label). */
export function formatDiscountBadge(d: ProductDiscount): string {
  const code = typeof d.code === "string" ? d.code.trim() : "";
  if (code.length > 0) return code;
  if (d.type === "percentage") return `${d.value}% OFF`;
  return `₹${d.value} OFF`;
}

function parseDiscount(p: Record<string, unknown>): ProductDiscount | null | undefined {
  const raw = p.discount;
  if (raw === null) return null;
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const code = typeof o.code === "string" ? o.code : "";
  const type = o.type === "fixed" || o.type === "percentage" ? o.type : "fixed";
  const value = Number(o.value);
  if (!Number.isFinite(value)) return undefined;
  return { code, type, value };
}

/** Maps a Mongo-backed product (API) to the `Product` shape used by cards and detail. */
export function mapMongoDocToProduct(
  p: Record<string, unknown>,
  opts?: { sellerId?: string }
): Product {
  const images = Array.isArray(p.images)
    ? (p.images as { url?: string }[])
        .map((i) => i?.url)
        .filter((u): u is string => typeof u === "string" && u.length > 0)
    : [];
  const primary = images[0] || "";

  const seller = p.seller;
  let artisanId = opts?.sellerId || "";
  if (!artisanId && seller && typeof seller === "object" && "_id" in seller) {
    artisanId = String((seller as { _id: unknown })._id);
  } else if (!artisanId && p.seller != null) {
    artisanId = String(p.seller);
  }

  const listPrice = Number(p.price) || 0;
  const finalRaw = p.finalPrice;
  const finalPrice =
    finalRaw != null && Number.isFinite(Number(finalRaw))
      ? Number(finalRaw)
      : listPrice;

  const discount = parseDiscount(p);

  let originalPrice: number | undefined;
  if (finalPrice < listPrice) {
    originalPrice = listPrice;
  } else if (p.originalPrice != null) {
    const msrp = Number(p.originalPrice);
    if (Number.isFinite(msrp) && msrp > finalPrice) {
      originalPrice = msrp;
    }
  }

  return {
    id: String(p._id),
    name: String(p.name || "Product"),
    description: String(p.description || ""),
    price: finalPrice,
    originalPrice,
    discount: discount === undefined ? null : discount,
    image: primary,
    images: images.length ? images : primary ? [primary] : [],
    category: String(p.category || ""),
    material: String(p.material || ""),
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
    artisanId,
    inStock: p.inStock !== false && p.available !== false,
    isReturnable: p.returnable === true,
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviews:
      typeof p.numRatings === "number"
        ? p.numRatings
        : typeof p.reviews === "number"
          ? p.reviews
          : 0,
    returnPolicy: p.returnable === true ? "Returnable" : "Check listing",
  };
}
