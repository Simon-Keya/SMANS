import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function FinanceReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const totalCollected = await prisma.payment.aggregate({
    _sum: { amount: true },
  });

  const pendingFees = await prisma.invoice.aggregate({
    where: { status: "pending" },
    _sum: { amount: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Finance Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              KSh {totalCollected._sum.amount?.toLocaleString() ?? "0"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Pending Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-error">
              KSh {pendingFees._sum.amount?.toLocaleString() ?? "0"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}