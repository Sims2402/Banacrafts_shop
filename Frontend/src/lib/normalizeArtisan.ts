import type { Artisan } from "@/data/artisans";

/** Normalize one row from GET /api/artisans (Mongo `artisans` collection or derived seller list). */
export function normalizeArtisanApiRow(raw: unknown): Artisan | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id =
    r.id != null
      ? String(r.id)
      : r._id != null
        ? String(r._id)
        : null;
  if (!id) return null;

  return {
    id,
    name: String(r.name ?? (r as { fullName?: string }).fullName ?? "Artisan"),
    specialty: String(
      r.specialty ??
        r.category ??
        (r as { craft?: string }).craft ??
        "Handmade products"
    ),
    experience: Number(r.experience) || 0,
    location: String(
      r.location ?? (r as { city?: string }).city ?? ""
    ),
    image: String(
      r.image ??
        r.profilePicture ??
        (r as { photo?: string }).photo ??
        (r as { avatar?: string }).avatar ??
        ""
    ),
    bio: String(
      r.bio ?? (r as { description?: string }).description ?? (r as { about?: string }).about ?? ""
    ),
    achievements: Array.isArray(r.achievements)
      ? (r.achievements as string[])
      : [],
    productsCount: Number(r.productsCount) || 0,
  };
}

export function normalizeArtisansList(data: unknown): Artisan[] {
  if (!Array.isArray(data)) return [];
  return data
    .map(normalizeArtisanApiRow)
    .filter((a): a is Artisan => a != null);
}
