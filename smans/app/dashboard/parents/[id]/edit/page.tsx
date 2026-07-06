// app/dashboard/parents/[id]/edit/page.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, User, Mail, Phone, Briefcase, Users } from "lucide-react";
import { updateParent } from "@/app/actions/parents/updateParent";

interface EditParentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditParentPage({ params }: EditParentPageProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Fetch parent data
  const [parent, classes, parents] = await Promise.all([
    prisma.parent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    }),
    prisma.class.findMany({
      select: { id: true, name: true, level: true },
      orderBy: { name: "asc" },
    }),
    prisma.parent.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <User className="h-8 w-8" />
              Edit Parent
            </h1>
            <p className="text-base-content/60 mt-1">
              Update {parent.name}'s information
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/dashboard/parents/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Parent
            </Link>
          </Button>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-base-200/50 rounded-xl border border-base-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-primary-content">
                  {initials}
                </span>
              </div>
              <div>
                <p className="font-semibold">{parent.name}</p>
                <p className="text-sm text-base-content/60">
                  {parent._count.students} children • {parent.relationship || "Parent"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {parent.user ? (
                <div className="badge badge-success gap-1">Active Account</div>
              ) : (
                <div className="badge badge-warning gap-1">No Account</div>
              )}
              <div className="badge badge-outline gap-1">
                <Users className="h-3 w-3" />
                {parent._count.students} Children
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
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

              {/* ✅ Using Server Action */}
              <form action={updateParent}>
                <input type="hidden" name="id" value={parent.id} />
                
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
                        Phone Number <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={parent.phone || ""}
                      className="input input-bordered w-full focus:input-primary transition-all duration-200"
                      placeholder="+254 700 000 000"
                      required
                    />
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
                        placeholder="e.g., Teacher, Doctor"
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
                  <div className="flex gap-4 pt-6 border-t border-base-300">
                    <button
                      type="submit"
                      className="btn btn-primary flex-1 gap-2 hover:scale-[1.02] transition-transform duration-200"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/dashboard/parents/${id}`}>
                        Cancel
                      </Link>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}