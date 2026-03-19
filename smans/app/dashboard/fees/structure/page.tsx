import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

// Explicit type
type SelectedFeeItem = {
  id: string;
  name: string;
  amount: number;
  frequency: string;
};

export default async function FeeStructurePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const feeItems: SelectedFeeItem[] = await prisma.feeItem.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      amount: true,
      frequency: true,
    },
  }) satisfies SelectedFeeItem[];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Fee Structure</h1>
        <Button asChild className="gap-2">
          <Link href="/dashboard/fees/structure/new">
            <Plus className="h-4 w-4" />
            Add Fee Item
          </Link>
        </Button>
      </div>

      {feeItems.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No fee items defined yet.
        </div>
      ) : (
        <div className="rounded-xl border border-base-300 overflow-x-auto shadow-sm">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b bg-base-200/80">
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Amount (KSh)</th>
                <th className="text-left p-4 font-semibold">Frequency</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-base-300/50 transition-colors">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">{item.amount.toLocaleString()}</td>
                  <td className="p-4 capitalize">{item.frequency}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/fees/structure/${item.id}/edit`}>
                        Edit
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