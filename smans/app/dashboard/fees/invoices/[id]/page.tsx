import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      student: { select: { name: true } },
      feeItem: { select: { name: true } },
      amount: true,
      dueDate: true,
      status: true,
      description: true,
      createdAt: true,
      payments: {
        select: {
          amount: true,
          method: true,
          status: true,
          paymentDate: true,
        },
      },
    },
  });

  if (!invoice) notFound();

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = invoice.amount - totalPaid;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Invoice #{invoice.id.slice(0, 8)}</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/fees/invoices">Back to Invoices</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Info */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Student</p>
              <p className="font-medium">{invoice.student.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fee Item</p>
              <p className="font-medium">{invoice.feeItem?.name || "Custom"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium text-xl">KSh {invoice.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
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
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{invoice.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="font-medium text-xl text-success">KSh {totalPaid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance Due</p>
              <p className="font-medium text-xl text-error">KSh {balance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payments recorded yet.</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Method</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">KSh {p.amount.toLocaleString()}</td>
                      <td className="p-3 capitalize">{p.method}</td>
                      <td className="p-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            p.status === "COMPLETED" ? "bg-success/20 text-success" : "bg-error/20 text-error"
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