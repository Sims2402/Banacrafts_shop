import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
  dispatched: { label: "Dispatched", className: "bg-purple-100 text-purple-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

const OrderStatusBadge = ({ status }: { status?: string }) => {
  if (!status) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  const config = statusConfig[status];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }
const normalizePaymentStatus = (status?: string) => {
  if (!status) return "pending";

  const s = status.toLowerCase();

  if (s === "paid" || s === "success") return "paid";
  if (s === "failed") return "failed";
  if (s === "refunded") return "refunded";

  return "pending";
};

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

export default OrderStatusBadge;
