// app/dashboard/parents/[id]/edit/page.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Briefcase,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface EditParentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditParentPage({ params }: EditParentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Only ADMIN can edit parents
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

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
      _count: {
        select: {
          students: true,
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
    <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-base-100 via-base-200/50 to-base-100">
      <div className="max-w-4xl mx-auto">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/dashboard/parents/${id}`}
              className="btn btn-ghost btn-sm gap-2 hover:bg-primary/10 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Parent
            </Link>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <span className="hidden sm:inline">Parent ID:</span>
              <code className="bg-base-300/50 px-2 py-1 rounded text-xs font-mono">
                {parent.id.slice(0, 8)}...
              </code>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <User className="h-8 w-8" />
                Edit Parent
              </h1>
              <p className="text-base-content/60 mt-1">
                Update parent/guardian information and details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge badge-lg badge-outline gap-2">
                <Users className="h-4 w-4" />
                {parent._count.students} Children
              </div>
              {parent.user ? (
                <div className="badge badge-lg badge-success gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active Account
                </div>
              ) : (
                <div className="badge badge-lg badge-warning gap-2">
                  <AlertCircle className="h-4 w-4" />
                  No Account
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Parent Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-base-200 rounded-2xl p-6 border border-base-300 sticky top-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-primary-content">
                    {initials}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{parent.name}</h3>
                <p className="text-sm text-base-content/60">{parent.relationship || "Parent"}</p>
              </div>

              <div className="divider my-4" />

              <div className="space-y-3 text-sm">
                {parent.email && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-base-100/50">
                    <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="truncate">{parent.email}</span>
                  </div>
                )}
                {parent.phone && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-base-100/50">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{parent.phone}</span>
                  </div>
                )}
                {parent.occupation && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-base-100/50">
                    <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{parent.occupation}</span>
                  </div>
                )}
                {parent.user?.createdAt && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-base-100/50">
                    <Users className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Member since {new Date(parent.user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="divider my-4" />

              <div className="text-center">
                <p className="text-xs text-base-content/60 uppercase tracking-wider">Total Children</p>
                <p className="text-3xl font-bold text-primary">{parent._count.students}</p>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-base-200 rounded-2xl p-6 md:p-8 border border-base-300 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h2 className="text-xl font-semibold">Parent Information</h2>
              </div>

              <form action={`/api/parents/${id}`} method="PATCH">
                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Full Name <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={parent.name}
                      className="input input-bordered w-full focus:input-primary transition-all duration-200"
                      placeholder="Enter parent's full name"
                      required
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/40">
                        This name will be displayed throughout the system
                      </span>
                    </label>
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={parent.email || ""}
                      className="input input-bordered w-full focus:input-primary transition-all duration-200"
                      placeholder="parent@example.com"
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/40">
                        Used for login and notifications
                      </span>
                    </label>
                  </div>

                  {/* Phone */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        Phone Number
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={parent.phone || ""}
                      className="input input-bordered w-full focus:input-primary transition-all duration-200"
                      placeholder="+254 700 000 000"
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/40">
                        Primary contact number
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Occupation */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Occupation
                        </span>
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        defaultValue={parent.occupation || ""}
                        className="input input-bordered w-full focus:input-primary transition-all duration-200"
                        placeholder="e.g., Teacher, Doctor, Business Owner"
                      />
                    </div>

                    {/* Relationship */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Relationship
                        </span>
                      </label>
                      <select
                        name="relationship"
                        defaultValue={parent.relationship || ""}
                        className="select select-bordered w-full focus:select-primary transition-all duration-200"
                      >
                        <option value="">Select relationship</option>
                        <option value="Father">👨 Father</option>
                        <option value="Mother">👩 Mother</option>
                        <option value="Guardian">👤 Guardian</option>
                        <option value="Grandparent">👴 Grandparent</option>
                        <option value="Sibling">👫 Sibling</option>
                        <option value="Other">🤝 Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-base-300">
                    <button
                      type="submit"
                      className="btn btn-primary flex-1 gap-2 hover:scale-[1.02] transition-transform duration-200"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                    <Link
                      href={`/dashboard/parents/${id}`}
                      className="btn btn-ghost flex-1 hover:bg-error/10 hover:text-error transition-all duration-200"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Link>
                  </div>
                </div>
              </form>
            </div>

            {/* Additional Actions */}
            <div className="mt-6 bg-base-200 rounded-2xl p-6 border border-base-300">
              <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-4">
                Additional Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/dashboard/parents/${id}`}
                  className="btn btn-sm btn-outline gap-2"
                >
                  <User className="h-4 w-4" />
                  View Profile
                </Link>
                <Link
                  href={`/dashboard/students/new?parentId=${id}`}
                  className="btn btn-sm btn-outline gap-2"
                >
                  <Users className="h-4 w-4" />
                  Add Child
                </Link>
                {!parent.user && (
                  <button
                    className="btn btn-sm btn-success gap-2"
                    onClick={() => {
                      // Handle create account
                    }}
                  >
                    <User className="h-4 w-4" />
                    Create Account
                  </button>
                )}
                <button
                  className="btn btn-sm btn-error btn-outline gap-2 ml-auto"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${parent.name}? This action cannot be undone.`)) {
                      // Handle delete
                    }
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Delete Parent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}