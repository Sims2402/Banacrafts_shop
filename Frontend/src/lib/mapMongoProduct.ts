import type { Product } from "@/data/products";
import { normalizeProductTags } from "@/lib/normalizeProductTags";

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

  const finalPrice = p.finalPrice != null ? Number(p.finalPrice) : null;
  const basePrice = Number(p.price) || 0;
  const qtyRaw = p.quantity;
  const quantity =
    typeof qtyRaw === "number" && Number.isFinite(qtyRaw)
      ? Math.max(0, Math.floor(qtyRaw))
      : 0;

  return {
    id: String(p._id),
    name: String(p.name || "Product"),
    description: String(p.description || ""),
    price: finalPrice != null && !Number.isNaN(finalPrice) ? finalPrice : basePrice,
    originalPrice:
      p.originalPrice != null ? Number(p.originalPrice) : undefined,
    image: primary,
    images: images.length ? images : primary ? [primary] : [],
    category: String(p.category || ""),
    material: String(p.material || ""),
    tags: normalizeProductTags(p.tags),
    artisanId,
    quantity,
    inStock: quantity > 0,
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
