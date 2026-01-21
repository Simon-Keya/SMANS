import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FeeStructurePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const feeItems = await prisma.feeItem.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Fee Structure</h1>
        <Button asChild className="btn-primary gap-2">
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
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-base-200">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Amount (KSh)</th>
                <th className="text-left p-4">Frequency</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-base-300/50">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4 font-medium">{item.amount.toLocaleString()}</td>
                  <td className="p-4 capitalize">{item.frequency}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/fees/structure/${item.id}/edit`}>Edit</Link>
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