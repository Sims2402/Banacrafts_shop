export type AwarenessArticleClient = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: number;
  publishedAt: string;
};

/** Normalize one row from GET /api/awareness (Mongo `awarenessarticles` via controller). */
export function normalizeAwarenessArticle(raw: unknown): AwarenessArticleClient | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id =
    r.id != null
      ? String(r.id)
      : r._id != null
        ? String(r._id)
        : null;
  if (!id) return null;

  const content = String(r.content ?? "");
  const excerptRaw = String(
    r.excerpt ?? (r as { description?: string }).description ?? ""
  );
  const excerpt =
    excerptRaw.trim() ||
    (content.trim() ? content.trim().slice(0, 220) + (content.length > 220 ? "…" : "") : "");

  return {
    id,
    title: String(r.title ?? "Article"),
    excerpt,
    content,
    image: String(r.image ?? ""),
    category: String(r.category ?? "General"),
    readTime: Math.max(1, Number(r.readTime) || 1),
    publishedAt: r.publishedAt
      ? String(r.publishedAt)
      : new Date().toISOString(),
  };
}

export function normalizeAwarenessList(data: unknown): AwarenessArticleClient[] {
  if (!Array.isArray(data)) return [];
  return data
    .map(normalizeAwarenessArticle)
    .filter((a): a is AwarenessArticleClient => a != null);
}
