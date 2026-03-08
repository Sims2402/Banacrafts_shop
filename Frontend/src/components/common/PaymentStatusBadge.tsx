import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: "pending" | "paid" | "failed" | "refunded";
}

const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const statusConfig = {
    pending: { label: "Payment Pending", className: "bg-orange-100 text-orange-800 border-orange-200" },
    paid: { label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800 border-red-200" },
    refunded: { label: "Refunded", className: "bg-gray-100 text-gray-800 border-gray-200" },
  };

  const config = statusConfig[status] ?? statusConfig.pending; // 🔑 fallback

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};
export default PaymentStatusBadge;