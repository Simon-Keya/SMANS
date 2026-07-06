// app/dashboard/parents/[id]/page.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
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
    console.log("🔍 Looking for parent with ID:", id);

    // Fetch parent with all related data
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            isActive: true,
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
                subject: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
                exam: {
                  select: {
                    id: true,
                    name: true,
                    term: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      console.log("❌ Parent not found with ID:", id);
      notFound();
    }

    console.log("✅ Parent found:", parent.id);
    console.log("🔑 Parent ID (use this for links):", parent.id);

    // Transform to match the normalized data structure
    const normalizedParent = {
      id: parent.id,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      occupation: parent.occupation,
      relationship: parent.relationship,
      students: parent.students || [],
      studentCount: parent.students?.length || 0,
      user: parent.user,
    };

    // Get initials
    const initials = parent.name
      ? parent.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "??";

    return (
      <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-base-100 via-base-200/50 to-base-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <User className="h-8 w-8" />
                Parent Details
              </h1>
              <p className="text-base-content/60 mt-1">
                View and manage parent/guardian information
              </p>
            </div>
            {/* ✅ FIX: Use parent.id (the actual Parent ID), not the URL parameter */}
            <Button asChild>
              <Link href={`/dashboard/parents/${parent.id}/edit`} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Parent
              </Link>
            </Button>
          </div>

          {/* Back Link */}
          <div className="mb-6">
            <Link
              href="/dashboard/parents"
              className="btn btn-ghost btn-sm gap-2 hover:bg-primary/10 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Parents
            </Link>
          </div>

          {/* Parent Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300 shadow-lg">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-3xl font-bold text-primary-content">
                      {initials}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary">{parent.name}</h2>
                  <p className="text-base-content/60">{parent.relationship || "Parent / Guardian"}</p>
                  {parent.user ? (
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-success/10 text-success rounded-full text-sm">
                      <span className="mr-1">●</span> Active Account
                    </div>
                  ) : (
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-warning/10 text-warning rounded-full text-sm">
                      <span className="mr-1">●</span> No Account
                    </div>
                  )}
                </div>

                <div className="divider" />

                <div className="space-y-3">
                  {parent.email && (
                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-base-100/50">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{parent.email}</span>
                    </div>
                  )}
                  {parent.phone && (
                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-base-100/50">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{parent.phone}</span>
                    </div>
                  )}
                  {parent.occupation && (
                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-base-100/50">
                      <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{parent.occupation}</span>
                    </div>
                  )}
                  {parent.user?.createdAt && (
                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-base-100/50 text-base-content/60">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Registered: {new Date(parent.user.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="divider" />

                <div className="text-center">
                  <p className="text-sm text-base-content/60">Total Children</p>
                  <p className="text-3xl font-bold text-primary">
                    {normalizedParent.studentCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Children Section */}
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Children ({normalizedParent.studentCount})
                </h3>

                {normalizedParent.students.length > 0 ? (
                  <div className="space-y-4">
                    {normalizedParent.students.map((student) => {
                      const studentGrades = student.grades || [];
                      const hasGrades = studentGrades.length > 0;

                      return (
                        <div
                          key={student.id}
                          className="bg-base-100 rounded-xl p-4 border border-base-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-wrap justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold">{student.name}</h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                                <p className="text-sm text-base-content/60">
                                  Admission: {student.admissionNumber || "N/A"}
                                </p>
                                <p className="text-sm text-base-content/60">
                                  Class: {student.class?.name || "Not assigned"}
                                  {student.class?.level && ` (${student.class.level})`}
                                </p>
                              </div>
                            </div>
                            <Link
                              href={`/dashboard/students/${student.id}`}
                              className="btn btn-sm btn-ghost gap-1"
                            >
                              View
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>

                          {/* Recent Grades */}
                          {hasGrades && (
                            <div className="mt-3 pt-3 border-t border-base-200">
                              <p className="text-xs text-base-content/60 mb-2">Recent Grades</p>
                              <div className="flex flex-wrap gap-2">
                                {studentGrades.slice(0, 3).map((grade: any) => (
                                  <span
                                    key={grade.id}
                                    className="badge badge-outline gap-1"
                                  >
                                    {grade.subject?.name || "Unknown Subject"}: {grade.marks}/{grade.maxMarks}
                                    {grade.exam?.name && ` (${grade.exam.name})`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-base-content/20 mx-auto mb-3" />
                    <p className="text-base-content/60">No children linked to this parent.</p>
                    <Link
                      href={`/dashboard/students/new?parentId=${parent.id}`}
                      className="btn btn-sm btn-primary mt-3"
                    >
                      Add Child
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4">
                <Button asChild variant="outline" className="flex-1 gap-2">
                  {/* ✅ FIX: Use parent.id here too */}
                  <Link href={`/dashboard/parents/${parent.id}/edit`}>
                    <Edit className="h-4 w-4" />
                    Edit Parent
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 gap-2">
                  {/* ✅ FIX: Use parent.id here too */}
                  <Link href={`/dashboard/students/new?parentId=${parent.id}`}>
                    <Users className="h-4 w-4" />
                    Add Child
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Error in ParentDetailPage:", error);
    // Return a user-friendly error page
    return (
      <div className="min-h-screen p-6 md:p-8 bg-base-100">
        <div className="max-w-7xl mx-auto">
          <div className="alert alert-error shadow-lg">
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