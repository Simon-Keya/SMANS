import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

// Type for invoice (including payments)
type InvoiceWithPayments = {
  id: string;
  student: { id: string; name: string | null };
  feeItem: { name: string } | null;
  amount: number;
  dueDate: Date;
  status: string;
  description: string | null;
  createdAt: Date;
  createdBy: { name: string | null } | null;
  approvedBy: { name: string | null } | null;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    paymentDate: Date;
    createdBy: { name: string | null } | null;
  }>;
};

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      student: { select: { id: true, name: true } },
      feeItem: { select: { name: true } },
      amount: true,
      dueDate: true,
      status: true,
      description: true,
      createdAt: true,
      createdBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
      payments: {
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          paymentDate: true,
          createdBy: { select: { name: true } },
        },
        orderBy: { paymentDate: "desc" },
      },
    },
  }) as InvoiceWithPayments | null;

  if (!invoice) notFound();

  // Explicit typing for reduce and map
  const totalPaid = invoice.payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
  const balance = invoice.amount - totalPaid;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">
          Invoice #{invoice.id.slice(0, 8)}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/fees/invoices">Back to Invoices</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-base-100 shadow-lg border-base-200">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-base-content/60">Student</p>
              <p className="font-medium">{invoice.student.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Fee Item</p>
              <p className="font-medium">{invoice.feeItem?.name || "Custom"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Amount</p>
              <p className="font-medium text-xl">KSh {invoice.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Due Date</p>
              <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Status</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  invoice.status === "PAID"
                    ? "bg-success/20 text-success"
                    : invoice.status === "PARTIAL"
                    ? "bg-warning/20 text-warning"
                    : "bg-error/20 text-error"
                }`}
              >
                {invoice.status}
              </span>
            </div>
            {invoice.description && (
              <div>
                <p className="text-sm text-base-content/60">Description</p>
                <p className="text-sm">{invoice.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border-base-200">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-base-content/60">Total Paid</p>
              <p className="font-medium text-xl text-success">
                KSh {totalPaid.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Balance Due</p>
              <p className="font-medium text-xl text-error">
                KSh {balance.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-base-100 shadow-lg border-base-200">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="text-center text-base-content/60 py-8">
              No payments recorded yet.
            </p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-base-200/50">
                    <th className="text-left p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Method</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-base-300/30">
                      <td className="p-3">KSh {p.amount.toLocaleString()}</td>
                      <td className="p-3 capitalize">{p.method}</td>
                      <td className="p-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            p.status === "COMPLETED"
                              ? "bg-success/20 text-success"
                              : "bg-error/20 text-error"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}