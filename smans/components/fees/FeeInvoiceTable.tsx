// components/fees/FeeInvoiceTable.tsx
"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Download, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  student: { name: string };
  amount: number;
  dueDate: Date;
  status: "pending" | "paid" | "overdue";
}

interface FeeInvoiceTableProps {
  invoices: Invoice[];
}

// Custom Badge wrapper with success variant
const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = () => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "paid":
        return "Paid";
      case "overdue":
        return "Overdue";
      default:
        return "Pending";
    }
  };

  return (
    <Badge variant="outline" className={cn("capitalize", getStyles())}>
      {getLabel()}
    </Badge>
  );
};

export default function FeeInvoiceTable({ invoices }: FeeInvoiceTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Amount (KSh)</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No invoices found.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.student.name}</TableCell>
                <TableCell>{inv.amount.toLocaleString()}</TableCell>
                <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <StatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild aria-label="View invoice">
                    <Link href={`/dashboard/fees/invoices/${inv.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="ghost" size="icon" aria-label="Download invoice">
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}