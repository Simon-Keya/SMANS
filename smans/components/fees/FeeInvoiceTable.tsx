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
                  <Badge
                    variant={
                      inv.status === "paid" ? "success" :
                      inv.status === "overdue" ? "destructive" : "default"
                    }
                    className="capitalize"
                  >
                    {inv.status}
                  </Badge>
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