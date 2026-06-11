// components/fees/PaymentHistory.tsx
import { Badge } from "@/components/ui/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/utils";
  
interface Payment {
  id: string;
  amount: number;
  paymentDate: Date;
  method: string;
  status: string;
  student?: { name: string };
}
  
interface PaymentHistoryProps {
  payments: Payment[];
}

// Helper function to get badge styling
const getPaymentStatusBadge = (status: string) => {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case "completed":
      return {
        variant: "default" as const,
        className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      };
    case "pending":
      return {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
      };
    case "failed":
      return {
        variant: "destructive" as const,
        className: ""
      };
    default:
      return {
        variant: "default" as const,
        className: ""
      };
  }
};
  
export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Amount (KSh)</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No payment history.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => {
              const badgeStyle = getPaymentStatusBadge(payment.status);
              return (
                <TableRow key={payment.id}>
                  <TableCell>{payment.student?.name ?? "—"}</TableCell>
                  <TableCell className="font-medium">{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{payment.method}</TableCell>
                  <TableCell>
                    <Badge
                      variant={badgeStyle.variant}
                      className={cn("capitalize", badgeStyle.className)}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}