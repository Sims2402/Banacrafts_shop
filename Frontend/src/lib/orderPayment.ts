/**
 * Normalize backend payment status for UI badges
 * + handles COD (paid on delivery)
 */
export function normalizePaymentStatusForBadge(
    value: unknown,
    orderStatus?: string // 👈 ADD THIS
  ): "pending" | "paid" | "failed" | "refunded" {
    const s = String(value ?? "").trim().toLowerCase();
    const order = String(orderStatus ?? "").toLowerCase();
  
    // 💥 COD LOGIC
    if ((s === "pending" || s === "cod") && order === "delivered") {
      return "paid";
    }
  
    if (s === "paid" || s === "complete" || s === "completed") return "paid";
    if (s === "failed") return "failed";
    if (s === "refunded") return "refunded";
  
    return "pending";
  }