import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const payments = await prisma.payment.findMany({
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Payments & Receipts</h1>

      {payments.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No payments recorded yet.
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-base-200">
                <th className="text-left p-4">Student</th>
                <th className="text-left p-4">Amount (KSh)</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Method</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => (
                <tr key={pay.id} className="border-b hover:bg-base-300/50">
                  <td className="p-4">{pay.invoice.student.name}</td>
                  <td className="p-4 font-medium">{pay.amount.toLocaleString()}</td>
                  <td className="p-4">{new Date(pay.paymentDate).toLocaleDateString()}</td>
                  <td className="p-4 capitalize">{pay.method}</td>
                  <td className="p-4">
                    <span className={`badge ${pay.status === "completed" ? "badge-success" : "badge-warning"}`}>
                      {pay.status}
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