// components/fees/PaymentStatusBadge.tsx
import { Badge } from "@/components/ui/Badge";

interface PaymentStatusBadgeProps {
  status: "pending" | "paid" | "overdue" | "completed" | string;
}

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  let variant: "default" | "secondary" | "success" | "destructive" = "default";

  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
      variant = "success";
      break;
    case "overdue":
      variant = "destructive";
      break;
    case "pending":
      variant = "secondary";
      break;
    default:
      variant = "default";
  }

  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}