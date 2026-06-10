import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ParentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ParentDetailPage({ params }: ParentDetailPageProps) {
  const { id } = await params;
  
  const parent = await prisma.user.findUnique({
    where: { 
      id, 
      role: "PARENT" // Changed from lowercase "parent" to uppercase "PARENT"
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // Include parent-specific data from the Parent model
      parent: {
        select: {
          phone: true,
          occupation: true,
          relationship: true,
          students: {
            select: {
              id: true,
              name: true,
              admissionNumber: true,
              class: {
                select: { name: true }
              }
            }
          }
        }
      }
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
              <p className="text-sm text-base-content/60">Phone</p>
              <p className="font-medium">{parent.parent?.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Occupation</p>
              <p className="font-medium">{parent.parent?.occupation || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Relationship</p>
              <p className="font-medium">{parent.parent?.relationship || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Registered On</p>
              <p className="font-medium">
                {new Date(parent.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Children Section */}
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Children</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parent.parent?.students && parent.parent.students.length > 0 ? (
              <div className="space-y-3">
                {parent.parent.students.map((student) => (
                  <div key={student.id} className="border-b pb-3 last:border-0">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-base-content/60">
                      Admission: {student.admissionNumber}
                    </p>
                    <p className="text-sm text-base-content/60">
                      Class: {student.class?.name || "Not assigned"}
                    </p>
                    <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1">
                      <Link href={`/dashboard/students/${student.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60">No children linked to this parent.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}