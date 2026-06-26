// app/dashboard/profile/page.tsx
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  Edit,
  Mail,
  Shield,
  Calendar,
  BadgeCheck,
  Hash,
  User,
  Clock,
  Activity,
  BookOpen,
  Users,
  FileText,
  Bell,
  CreditCard,
  GraduationCap,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCircle,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch full user record with related data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      student: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
              level: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      teacherClasses: {
        select: {
          id: true,
          name: true,
          level: true,
          _count: {
            select: {
              students: true,
            },
          },
        },
      },
      parent: {
        include: {
          students: {
            select: {
              id: true,
              name: true,
              admissionNumber: true,
              class: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          notifications: true,
          createdInvoices: true,
          createdPayments: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Helper function to get role-specific data
  const getRoleData = () => {
    switch (user.role) {
      case "ADMIN":
        return {
          icon: Shield,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
          label: "System Administrator",
          description: "Full system access and management",
        };
      case "TEACHER":
        return {
          icon: BookOpen,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          label: "Teacher",
          description: "Manage classes, students, and academics",
        };
      case "STUDENT":
        return {
          icon: GraduationCap,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          label: "Student",
          description: "Access learning materials and track progress",
        };
      case "PARENT":
        return {
          icon: Users,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          label: "Parent",
          description: "Monitor children's academic progress",
        };
      case "ACCOUNTANT":
        return {
          icon: CreditCard,
          color: "text-teal-500",
          bgColor: "bg-teal-500/10",
          label: "Accountant",
          description: "Manage fees, invoices, and payments",
        };
      default:
        return {
          icon: User,
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          label: user.role,
          description: "",
        };
    }
  };

  const roleData = getRoleData();
  const RoleIcon = roleData.icon;

  // Get quick stats based on role
  const getQuickStats = () => {
    const stats = [];

    // Common stats for all roles
    stats.push({
      label: "Notifications",
      value: user._count.notifications || 0,
      icon: Bell,
      color: "text-yellow-500",
    });

    // Role-specific stats
    switch (user.role) {
      case "ADMIN":
        stats.push(
          {
            label: "Invoices",
            value: user._count.createdInvoices || 0,
            icon: FileText,
            color: "text-blue-500",
          },
          {
            label: "Payments",
            value: user._count.createdPayments || 0,
            icon: CreditCard,
            color: "text-green-500",
          }
        );
        break;
      case "TEACHER":
        const teacherClasses = user.teacherClasses || [];
        const totalStudents = teacherClasses.reduce(
          (acc: number, cls: any) => acc + cls._count.students,
          0
        );
        stats.push(
          {
            label: "Classes",
            value: teacherClasses.length,
            icon: BookOpen,
            color: "text-blue-500",
          },
          {
            label: "Students",
            value: totalStudents,
            icon: Users,
            color: "text-green-500",
          }
        );
        break;
      case "STUDENT":
        const student = user.student;
        if (student) {
          stats.push(
            {
              label: "Class",
              value: student.class?.name || "Not assigned",
              icon: BookOpen,
              color: "text-blue-500",
            },
            {
              label: "Admission",
              value: student.admissionNumber || "N/A",
              icon: Hash,
              color: "text-purple-500",
            }
          );
        }
        break;
      case "PARENT":
        const parent = user.parent;
        if (parent) {
          stats.push({
            label: "Children",
            value: parent.students?.length || 0,
            icon: Users,
            color: "text-green-500",
          });
        }
        break;
      case "ACCOUNTANT":
        stats.push(
          {
            label: "Invoices",
            value: user._count.createdInvoices || 0,
            icon: FileText,
            color: "text-purple-500",
          },
          {
            label: "Payments",
            value: user._count.createdPayments || 0,
            icon: CreditCard,
            color: "text-teal-500",
          }
        );
        break;
    }

    return stats;
  };

  const quickStats = getQuickStats();

  return (
    <div className="space-y-8">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-base-200 p-8 border border-base-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <h1 className="text-3xl font-bold text-primary">My Profile</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleData.bgColor} ${roleData.color}`}>
                <RoleIcon className="inline h-4 w-4 mr-1" />
                {roleData.label}
              </span>
            </div>
          </div>
          <p className="text-base-content/70 mt-2">
            Manage your personal information and account settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-base-100 shadow-lg border border-base-200 overflow-hidden">
            <div className="relative h-24 bg-gradient-to-r from-primary to-primary/60">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <Avatar className="w-24 h-24 border-4 border-base-100 shadow-xl">
                  <AvatarFallback className="bg-primary text-primary-content text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CardHeader className="pt-16 text-center pb-4">
              <CardTitle className="text-2xl text-primary">
                {user.name ?? "Unnamed User"}
              </CardTitle>
              <p className="text-base-content/70 text-sm">{user.email}</p>

              <div className="flex justify-center gap-2 mt-2">
                {user.emailVerified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Unverified
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-base-200/50 text-base-content/70 border border-base-300 capitalize">
                  {user.role.toLowerCase()}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
                  <span className="text-base-content/60">Email</span>
                  <span className="font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4 text-primary" />
                    {user.email}
                  </span>
                </div>

                {user.staffNo && (
                  <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
                    <span className="text-base-content/60">Staff No.</span>
                    <span className="font-medium flex items-center gap-1">
                      <Hash className="h-4 w-4 text-primary" />
                      {user.staffNo}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
                  <span className="text-base-content/60">Member Since</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    {user.createdAt.toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
                  <span className="text-base-content/60">Last Active</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    {user.updatedAt.toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t border-base-200">
                <div className="grid grid-cols-3 gap-2">
                  {quickStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <stat.icon className={`h-5 w-5 mx-auto ${stat.color}`} />
                      <p className="text-lg font-bold text-base-content mt-1">
                        {typeof stat.value === 'number' ? stat.value : stat.value}
                      </p>
                      <p className="text-xs text-base-content/60">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-base-100 shadow-lg border border-base-200">
            <CardContent className="p-4 space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <Link href="/dashboard/profile/edit">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <Link href="/dashboard/settings/security">
                  <Shield className="h-4 w-4" />
                  Security Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <Card className="bg-base-100 shadow-lg border border-base-200">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                      Full Name
                    </p>
                    <p className="font-medium text-base-content flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      {user.name ?? "Not set"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                      Email Address
                    </p>
                    <p className="font-medium text-base-content flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                      Role
                    </p>
                    <p className="font-medium text-base-content capitalize flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {user.staffNo && (
                    <div>
                      <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                        Staff Number
                      </p>
                      <p className="font-medium text-base-content flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        {user.staffNo}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                      Email Status
                    </p>
                    <p className="font-medium text-base-content flex items-center gap-2">
                      {user.emailVerified ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-success" />
                          Verified on {user.emailVerified.toLocaleDateString("en-KE")}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-error" />
                          Not verified
                        </>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                      Account Created
                    </p>
                    <p className="font-medium text-base-content flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {user.createdAt.toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-Specific Information */}
          {user.role === "TEACHER" && user.teacherClasses && user.teacherClasses.length > 0 && (
            <Card className="bg-base-100 shadow-lg border border-base-200">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Teaching Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {user.teacherClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{cls.name}</p>
                          <p className="text-xs text-base-content/60">
                            Level: {cls.level || 'N/A'} • {cls._count.students} students
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-base-content/40" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user.role === "STUDENT" && user.student && (
            <Card className="bg-base-100 shadow-lg border border-base-200">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                      Admission Number
                    </p>
                    <p className="font-medium">{user.student.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                      Current Class
                    </p>
                    <p className="font-medium">
                      {user.student.class?.name || "Not assigned"}
                    </p>
                  </div>
                  {user.student.parent && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                        Parent/Guardian
                      </p>
                      <p className="font-medium">
                        {user.student.parent.name} ({user.student.parent.phone || "No phone"})
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {user.role === "PARENT" && user.parent && (
            <Card className="bg-base-100 shadow-lg border border-base-200">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Children Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.parent.students && user.parent.students.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {user.parent.students.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{child.name}</p>
                          <p className="text-xs text-base-content/60">
                            {child.admissionNumber} • {child.class?.name || "No class"}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-base-content/40" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base-content/60">No children linked to your account.</p>
                )}
              </CardContent>
            </Card>
          )}

          {user.role === "ACCOUNTANT" && (
            <Card className="bg-base-100 shadow-lg border border-base-200">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-base-200/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">
                      {user._count.createdInvoices}
                    </p>
                    <p className="text-sm text-base-content/60">Invoices Created</p>
                  </div>
                  <div className="p-4 bg-base-200/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">
                      {user._count.createdPayments}
                    </p>
                    <p className="text-sm text-base-content/60">Payments Processed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}