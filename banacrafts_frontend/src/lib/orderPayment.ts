/**
 * Map API `paymentStatus` string to PaymentStatusBadge props (case only; no business rules).
 */
export function normalizePaymentStatusForBadge(
  value: unknown
): "pending" | "paid" | "failed" | "refunded" {
  const s = String(value ?? "").trim().toLowerCase();
  if (s === "paid" || s === "complete" || s === "completed") return "paid";
  if (s === "failed") return "failed";
  if (s === "refunded") return "refunded";
  return "pending";
}
