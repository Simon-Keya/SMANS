import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { InvoiceStatus } from "@prisma/client"; // Import the enum

export default async function FinanceReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const totalCollected = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "COMPLETED", // Only count completed payments
    },
  });

  const pendingFees = await prisma.invoice.aggregate({
    where: { status: InvoiceStatus.PENDING }, // Use enum value (uppercase)
    _sum: { amount: true },
  });

  // Also get overdue invoices
  const overdueFees = await prisma.invoice.aggregate({
    where: { 
      status: InvoiceStatus.OVERDUE,
    },
    _sum: { amount: true },
  });

  // Get partially paid invoices
  const partialFees = await prisma.invoice.aggregate({
    where: { 
      status: InvoiceStatus.PARTIAL,
    },
    _sum: { amount: true },
  });

  // Get total invoiced amount
  const totalInvoiced = await prisma.invoice.aggregate({
    _sum: { amount: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Finance Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-success">
              KSh {totalCollected._sum.amount?.toLocaleString() ?? "0"}
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              From completed payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Pending Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-warning">
              KSh {pendingFees._sum.amount?.toLocaleString() ?? "0"}
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              Invoices awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Overdue Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-error">
              KSh {overdueFees._sum.amount?.toLocaleString() ?? "0"}
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              Past due date invoices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Partial Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-info">
              KSh {partialFees._sum.amount?.toLocaleString() ?? "0"}
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              Invoices partially paid
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              KSh {totalInvoiced._sum.amount?.toLocaleString() ?? "0"}
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              All invoices ever created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Collection Rate */}
      <Card className="bg-base-100 shadow-lg border border-base-200">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Collection Rate</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const collected = totalCollected._sum.amount || 0;
            const total = totalInvoiced._sum.amount || 0;
            const rate = total > 0 ? (collected / total) * 100 : 0;
            
            return (
              <div>
                <p className="text-4xl font-bold text-primary">
                  {rate.toFixed(1)}%
                </p>
                <p className="text-sm text-base-content/60 mt-2">
                  {rate >= 80 ? "Excellent" : rate >= 60 ? "Good" : rate >= 40 ? "Average" : "Poor"} collection rate
                </p>
                <div className="mt-4 h-2 bg-base-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}