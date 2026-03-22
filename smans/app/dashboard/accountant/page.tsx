import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { DollarSign, FileText, Clock, TrendingUp } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic"; // ensure fresh data

async function getAccountantStats() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    pendingInvoices,
    recentPaymentsCount,
    overdueInvoices,
    totalRevenueThisMonth,
  ] = await Promise.all([
    // Pending invoices
    prisma.invoice.count({
      where: { status: "PENDING" },
    }),

    // Payments this week
    prisma.payment.count({
      where: {
        paymentDate: { gte: startOfWeek },
        status: "COMPLETED",
      },
    }),

    // Overdue invoices
    prisma.invoice.count({
      where: {
        status: "OVERDUE",
        dueDate: { lt: now },
      },
    }),

    // Total revenue this month
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        paymentDate: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    pendingInvoices,
    recentPaymentsCount,
    overdueInvoices,
    totalRevenueThisMonth: totalRevenueThisMonth._sum.amount ?? 0,
  };
}

export default async function AccountantDashboard() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ACCOUNTANT") {
    redirect("/dashboard");
  }

  const stats = await getAccountantStats();

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Accountant Dashboard</h1>
        <p className="text-sm text-base-content/70">
          Welcome back, {user.name || "Accountant"}
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading stats...</div>}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Pending Invoices */}
          <Card className="bg-base-100 shadow-lg border-base-200 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Pending Invoices</CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingInvoices}</div>
              <p className="text-sm text-base-content/60 mt-1">Awaiting payment</p>
            </CardContent>
          </Card>

          {/* Payments This Week */}
          <Card className="bg-base-100 shadow-lg border-base-200 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Payments This Week</CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.recentPaymentsCount}</div>
              <p className="text-sm text-base-content/60 mt-1">Received payments</p>
            </CardContent>
          </Card>

          {/* Overdue Invoices */}
          <Card className="bg-base-100 shadow-lg border-base-200 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Overdue Invoices</CardTitle>
              <Clock className="h-5 w-5 text-error" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-error">{stats.overdueInvoices}</div>
              <p className="text-sm text-base-content/60 mt-1">Past due date</p>
            </CardContent>
          </Card>

          {/* Total Revenue This Month */}
          <Card className="bg-base-100 shadow-lg border-base-200 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Revenue This Month</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                KSh {stats.totalRevenueThisMonth.toLocaleString()}
              </div>
              <p className="text-sm text-base-content/60 mt-1">Total collected</p>
            </CardContent>
          </Card>
        </div>
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card className="bg-base-100 shadow-lg border-base-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild size="lg" className="justify-start">
              <Link href="/dashboard/fees/invoices/new">
                Generate New Invoice
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="justify-start">
              <Link href="/dashboard/fees/payments">
                Record Payment
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="justify-start">
              <Link href="/dashboard/fees/structure/new">
                Add Fee Item
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card className="bg-base-100 shadow-lg border-base-200">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base-content/70">
              Recent payments and invoices will appear here.
            </p>
            {/* You can add a real recent activity list later */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}