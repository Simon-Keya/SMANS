import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { AlertCircle, CreditCard, DollarSign } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InvoiceStatus, PaymentStatus } from "@prisma/client";

export default async function FeesDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Calculate total due from invoices (PENDING, PARTIAL, OVERDUE)
  const totalDue = await prisma.invoice.aggregate({
    where: {
      status: {
        in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE]
      }
    },
    _sum: { amount: true },
  });

  // Calculate total paid from completed payments
  const totalPaid = await prisma.payment.aggregate({
    where: { status: PaymentStatus.COMPLETED },
    _sum: { amount: true },
  });

  // Count overdue invoices
  const overdue = await prisma.invoice.count({
    where: { status: InvoiceStatus.OVERDUE },
  });

  // Get recent payments
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    where: { status: PaymentStatus.COMPLETED },
    include: {
      invoice: {
        include: {
          student: {
            select: { name: true, admissionNumber: true }
          }
        }
      }
    },
    orderBy: { paymentDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Fees & Payments</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              KSh {totalDue._sum.amount?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-base-content/60 mt-1">
              From pending, partial & overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              KSh {totalPaid._sum.amount?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-base-content/60 mt-1">
              From completed payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertCircle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{overdue}</div>
            <p className="text-xs text-base-content/60 mt-1">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Table */}
      {recentPayments.length > 0 && (
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Method</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="p-2">{payment.invoice.student.name}</td>
                      <td className="p-2">KSh {payment.amount.toLocaleString()}</td>
                      <td className="p-2 capitalize">{payment.method}</td>
                      <td className="p-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button asChild variant="outline" className="h-24 flex flex-col gap-2">
          <Link href="/dashboard/fees/structure">
            <span className="text-lg font-semibold">Fee Structure</span>
            <span className="text-sm text-base-content/70">View & manage fee items</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-24 flex flex-col gap-2">
          <Link href="/dashboard/fees/invoices">
            <span className="text-lg font-semibold">Invoices</span>
            <span className="text-sm text-base-content/70">Generate & track invoices</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-24 flex flex-col gap-2">
          <Link href="/dashboard/fees/payments">
            <span className="text-lg font-semibold">Payments</span>
            <span className="text-sm text-base-content/70">Record & reconcile payments</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}