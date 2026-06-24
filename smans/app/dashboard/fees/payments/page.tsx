// app/dashboard/fees/payments/page.tsx
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PaymentStatus } from "@prisma/client";

type SelectedPayment = {
  id: string;
  invoice: {
    student: {
      name: string | null;
    };
  };
  amount: number;
  paymentDate: Date;
  method: string;
  status: PaymentStatus;
};

interface PaymentsPageProps {
  searchParams: Promise<{ status?: string; startDate?: string; endDate?: string }>;
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const session = await getServerSession(authOptions);

  // ✅ Only ADMIN and ACCOUNTANT can view payments
  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const statusFilter = params.status as PaymentStatus | undefined;
  const startDateFilter = params.startDate ? new Date(params.startDate) : undefined;
  const endDateFilter = params.endDate ? new Date(params.endDate) : undefined;

  const payments = await prisma.payment.findMany({
    where: {
      status: statusFilter,
      paymentDate: {
        gte: startDateFilter,
        lte: endDateFilter,
      },
    },
    select: {
      id: true,
      invoice: {
        select: {
          student: { select: { name: true } },
        },
      },
      amount: true,
      paymentDate: true,
      method: true,
      status: true,
    },
    orderBy: { paymentDate: "desc" },
  });

  const typedPayments = payments as SelectedPayment[];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Payments & Receipts</h1>
        <p className="text-muted-foreground mt-1">View and manage all payment records</p>
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
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
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

      {typedPayments.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No payments match the current filters.
        </div>
      ) : (
        <div className="rounded-xl border border-base-300 overflow-x-auto shadow-sm">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b bg-base-200/80">
                <th className="text-left p-4 font-semibold">Student</th>
                <th className="text-left p-4 font-semibold">Amount (KSh)</th>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Method</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {typedPayments.map((pay) => (
                <tr key={pay.id} className="border-b hover:bg-base-300/50 transition-colors">
                  <td className="p-4">{pay.invoice.student.name || "—"}</td>
                  <td className="p-4 font-medium">{pay.amount.toLocaleString()}</td>
                  <td className="p-4">{new Date(pay.paymentDate).toLocaleDateString()}</td>
                  <td className="p-4 capitalize">{pay.method.toLowerCase()}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        pay.status === "COMPLETED"
                          ? "bg-success/20 text-success"
                          : pay.status === "PENDING"
                          ? "bg-warning/20 text-warning"
                          : "bg-error/20 text-error"
                      }`}
                    >
                      {pay.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/fees/payments/${pay.id}`}>
                        View Receipt
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