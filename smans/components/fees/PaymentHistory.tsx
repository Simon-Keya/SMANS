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
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.student?.name ?? "—"}</TableCell>
                  <TableCell className="font-medium">{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{payment.method}</TableCell>
                  <TableCell>
                    <Badge
                      variant={payment.status === "completed" ? "success" : "destructive"}
                      className="capitalize"
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }