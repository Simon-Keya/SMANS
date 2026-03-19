import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { AlertCircle, CreditCard, DollarSign } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
export default async function FeesDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Sample stats (replace with real queries)
  const totalDue = await prisma.feeTransaction.aggregate({
    where: { status: "pending" },
    _sum: { amount: true },
  });

  const totalPaid = await prisma.feeTransaction.aggregate({
    where: { status: "paid" },
    _sum: { amount: true },
  });

  const overdue = await prisma.feeTransaction.count({
    where: { status: "overdue" },
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
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              KSh {totalPaid._sum.amount?.toLocaleString() ?? "0"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{overdue}</div>
          </CardContent>
        </Card>
      </div>

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