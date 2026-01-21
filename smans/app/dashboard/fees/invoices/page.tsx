import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const invoices = await prisma.invoice.findMany({
    select: {
      id: true,
      student: { select: { name: true } },
      amount: true,
      dueDate: true,
      status: true,
    },
    orderBy: { dueDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Invoices</h1>
        <Button asChild className="btn-primary">
          <Link href="/dashboard/fees/invoices/new">Generate Invoice</Link>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No invoices generated yet.
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-base-200">
                <th className="text-left p-4">Student</th>
                <th className="text-left p-4">Amount (KSh)</th>
                <th className="text-left p-4">Due Date</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b hover:bg-base-300/50">
                  <td className="p-4">{inv.student.name}</td>
                  <td className="p-4 font-medium">{inv.amount.toLocaleString()}</td>
                  <td className="p-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`badge ${inv.status === "paid" ? "badge-success" : "badge-warning"}`}>
                      {inv.status}
                    </span>
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