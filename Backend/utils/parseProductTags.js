/**
 * Normalize tags from multipart or JSON body into a string[] for MongoDB.
 * Handles arrays, JSON array strings, and comma-separated text; trims each tag.
 */
export function parseProductTags(tags) {
  if (tags == null || tags === "") return [];

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
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) {
          return parsed
            .map((t) => String(t).trim())
            .filter((t) => t.length > 0);
        }
      } catch {
        /* treat as plain text */
      }
    }

    return s
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  return [];
}
