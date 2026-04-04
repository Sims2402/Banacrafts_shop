/** GET JSON and require a JSON array body (or empty array on malformed success). */
export async function fetchJsonArray(url: string): Promise<unknown[]> {
  const res = await fetch(url);
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      data &&
      typeof data === "object" &&
      data !== null &&
      "error" in data
        ? String((data as { error: string }).error)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    "error" in (data as object)
  ) {
    throw new Error(String((data as { error: string }).error));
  }
  return [];
}
