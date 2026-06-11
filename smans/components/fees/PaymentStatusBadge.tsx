// components/fees/PaymentStatusBadge.tsx
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: "pending" | "paid" | "overdue" | "completed" | string;
}

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const statusLower = status.toLowerCase();
  
  // Determine badge variant and custom styling
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let customClass = "";
  
  switch (statusLower) {
    case "paid":
    case "completed":
      variant = "default";
      customClass = "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
      break;
    case "overdue":
      variant = "destructive";
      break;
    case "pending":
      variant = "secondary";
      customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
      break;
    default:
      variant = "default";
  }

  return (
    <Badge variant={variant} className={cn("capitalize", customClass)}>
      {status}
    </Badge>
  );
}