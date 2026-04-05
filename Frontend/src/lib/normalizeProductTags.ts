/**
 * Coerce product tags from API/DB into a clean string[] for UI (badges, map).
 * Handles arrays, JSON strings like ["a","b"], comma-separated text, and stray strings.
 */
export function normalizeProductTags(tags: unknown): string[] {
  if (tags == null) return [];

  if (Array.isArray(tags)) {
    return tags
      .map((t) => String(t).trim())
      .filter((t) => t.length > 0);
  }

  if (typeof tags === "string") {
    const s = tags.trim();
    if (!s) return [];

    if (s.startsWith("[")) {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (Array.isArray(parsed)) {
          return parsed
            .map((t) => String(t).trim())
            .filter((t) => t.length > 0);
        }
      } catch {
        /* treat as plain text below */
      }
    }

    return s
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  return [];
}
