// app/dashboard/parents/[id]/page.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Users,
  Calendar,
  Edit,
  User,
  Briefcase,
  GraduationCap,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface ParentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ParentDetailPage({ params }: ParentPageProps) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/auth/login");
    }

    // Only ADMIN can view parent details
    if (user.role !== "ADMIN") {
      redirect("/dashboard");
    }

    const { id } = await params;

    // Validate ID
    if (!id) {
      return (
        <div className="min-h-screen p-6 md:p-8 bg-base-100">
          <div className="max-w-7xl mx-auto">
            <div className="alert alert-error">
              <AlertCircle className="h-6 w-6" />
              <span>Invalid parent ID provided.</span>
            </div>
            <Link href="/dashboard/parents" className="btn btn-primary mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Parents
            </Link>
          </div>
        </div>
      );
    }

    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        students: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            grades: {
              take: 3,
              orderBy: { createdAt: "desc" },
              include: {
                subject: true,
              },
            },
            invoices: {
              where: {
                status: {
                  in: ["PENDING", "PARTIAL", "OVERDUE"],
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      notFound();
    }

    const initials = parent.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="min-h-screen p-6 md:p-8 bg-base-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/parents"
                className="btn btn-ghost btn-sm gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Parents
              </Link>
              <div className="flex-1" />
              <Link
                href={`/dashboard/parents/${id}/edit`}
                className="btn btn-primary gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Parent
              </Link>
            </div>
          </div>

          {/* Parent Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary">
                      {initials}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary">{parent.name}</h2>
                  <p className="text-base-content/60">Parent / Guardian</p>
                  {parent.user && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-success/10 text-success rounded-full text-sm">
                      <span className="mr-1">●</span> Active Account
                    </div>
                  )}
                </div>

                <div className="divider" />

                <div className="space-y-3">
                  {parent.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{parent.email}</span>
                    </div>
                  )}
                  {parent.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{parent.phone}</span>
                    </div>
                  )}
                  {parent.occupation && (
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span>{parent.occupation}</span>
                    </div>
                  )}
                  {parent.relationship && (
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Relationship: {parent.relationship}</span>
                    </div>
                  )}
                  {parent.user?.createdAt && (
                    <div className="flex items-center gap-3 text-sm text-base-content/60">
                      <Calendar className="h-4 w-4" />
                      <span>Registered: {new Date(parent.user.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="divider" />

                <div className="text-center">
                  <p className="text-sm text-base-content/60">Total Children</p>
                  <p className="text-3xl font-bold text-primary">
                    {parent.students.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Children Section */}
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Children ({parent.students.length})
                </h3>

                {parent.students.length > 0 ? (
                  <div className="space-y-4">
                    {parent.students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-base-100 rounded-xl p-4 border border-base-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-primary" />
                              <h4 className="font-semibold">{student.name}</h4>
                            </div>
                            <p className="text-sm text-base-content/60">
                              Admission: {student.admissionNumber}
                            </p>
                            <p className="text-sm text-base-content/60">
                              Class: {student.class?.name || "Not assigned"} • 
                              Level: {student.class?.level || "N/A"}
                            </p>
                            {student.invoices && student.invoices.length > 0 && (
                              <p className="text-sm text-error">
                                Pending Invoices: {student.invoices.length}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <Link
                              href={`/dashboard/students/${student.id}`}
                              className="btn btn-sm btn-ghost"
                            >
                              View Student
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>

                        {/* Recent Grades */}
                        {student.grades && student.grades.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-base-200">
                            <p className="text-xs text-base-content/60 mb-2">Recent Grades</p>
                            <div className="flex flex-wrap gap-2">
                              {student.grades.map((grade) => (
                                <span
                                  key={grade.id}
                                  className="badge badge-outline"
                                >
                                  {grade.subject?.name || "Unknown"}: {grade.marks}/{grade.maxMarks}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base-content/60">No children linked to this parent.</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href={`/dashboard/parents/${id}/edit`}
                  className="btn btn-outline w-full"
                >
                  <Edit className="h-4 w-4" />
                  Edit Parent
                </Link>
                <Link
                  href={`/dashboard/students/new?parentId=${id}`}
                  className="btn btn-outline w-full"
                >
                  <Users className="h-4 w-4" />
                  Add Child
                </Link>
                <button
                  className="btn btn-error btn-outline w-full"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this parent?")) {
                      // Handle delete
                    }
                  }}
                >
                  Delete Parent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ParentDetailPage:", error);
    
    // Return an error page instead of crashing
    return (
      <div className="min-h-screen p-6 md:p-8 bg-base-100">
        <div className="max-w-7xl mx-auto">
          <div className="alert alert-error">
            <AlertCircle className="h-6 w-6" />
            <div>
              <h3 className="font-bold">Something went wrong!</h3>
              <p className="text-sm">There was an error loading the parent details. Please try again.</p>
            </div>
          </div>
          <Link href="/dashboard/parents" className="btn btn-primary mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parents
          </Link>
        </div>
      </div>
    );
  }
}