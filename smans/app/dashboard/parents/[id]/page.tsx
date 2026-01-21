import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
interface ParentDetailPageProps {
  params: { id: string };
}

export default async function ParentDetailPage({ params }: ParentDetailPageProps) {
  const parent = await prisma.user.findUnique({
    where: { id: params.id, role: "parent" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!parent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/parents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">{parent.name ?? "Unnamed Parent"}</h1>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/dashboard/parents/${parent.id}/edit`}>
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-base-content/60">Email</p>
              <p className="font-medium">{parent.email}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Registered On</p>
              <p className="font-medium">
                {new Date(parent.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* You can add children list, contact info, etc. here */}
      </div>
    </div>
  );
}