// app/dashboard/fees/invoices/page.tsx
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InvoiceStatus } from "@prisma/client";

type SelectedInvoice = {
  id: string;
  student: { name: string | null };
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
};

interface InvoicesPageProps {
  searchParams: Promise<{ status?: string; startDate?: string; endDate?: string }>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const session = await getServerSession(authOptions);

  // ✅ Only ADMIN and ACCOUNTANT can view invoices
  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const statusFilter = params.status as InvoiceStatus | undefined;
  const startDateFilter = params.startDate ? new Date(params.startDate) : undefined;
  const endDateFilter = params.endDate ? new Date(params.endDate) : undefined;

  const invoices = await prisma.invoice.findMany({
    where: {
      status: statusFilter,
      dueDate: {
        gte: startDateFilter,
        lte: endDateFilter,
      },
    },
    select: {
      id: true,
      student: { select: { name: true } },
      amount: true,
      dueDate: true,
      status: true,
    },
    orderBy: { dueDate: "desc" },
  });

  const typedInvoices: SelectedInvoice[] = invoices as SelectedInvoice[];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track all invoices</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/fees/invoices/new">Generate Invoice</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            defaultValue={params.status || ""}
            className="border rounded px-3 py-2 bg-base-100"
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set("status", e.target.value);
              else url.searchParams.delete("status");
              window.location.href = url.toString();
            }}
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            defaultValue={params.startDate || ""}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set("startDate", e.target.value);
              else url.searchParams.delete("startDate");
              window.location.href = url.toString();
            }}
            className="border rounded px-3 py-2 bg-base-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            defaultValue={params.endDate || ""}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set("endDate", e.target.value);
              else url.searchParams.delete("endDate");
              window.location.href = url.toString();
            }}
            className="border rounded px-3 py-2 bg-base-100"
          />
        </div>
      </div>

      {typedInvoices.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No invoices match the current filters.
        </div>
      ) : (
        <div className="rounded-xl border border-base-300 overflow-x-auto shadow-sm">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b bg-base-200/80">
                <th className="text-left p-4 font-semibold">Student</th>
                <th className="text-left p-4 font-semibold">Amount (KSh)</th>
                <th className="text-left p-4 font-semibold">Due Date</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {typedInvoices.map((inv) => (
                <tr key={inv.id} className="border-b hover:bg-base-300/50 transition-colors">
                  <td className="p-4">{inv.student.name || "—"}</td>
                  <td className="p-4 font-medium">{inv.amount.toLocaleString()}</td>
                  <td className="p-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        inv.status === "PAID"
                          ? "bg-success/20 text-success"
                          : inv.status === "PARTIAL"
                          ? "bg-warning/20 text-warning"
                          : inv.status === "OVERDUE"
                          ? "bg-error/20 text-error"
                          : "bg-warning/20 text-warning"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/fees/invoices/${inv.id}`}>
                        View Invoice
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}