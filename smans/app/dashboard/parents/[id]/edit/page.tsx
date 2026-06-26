// app/dashboard/parents/[id]/edit/page.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

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
        },
      },
    },
  });

  if (!parent) {
    notFound();
  }

  return (
    <div className="min-h-screen p-6 md:p-8 bg-base-100">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/parents/${id}`}
              className="btn btn-ghost btn-sm gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Parent
            </Link>
            <h1 className="text-2xl font-bold text-primary flex-1">Edit Parent</h1>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
          <form action={`/api/parents/${id}`} method="PATCH">
            <div className="space-y-6">
              {/* Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={parent.name}
                  className="input input-bordered"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={parent.email || ""}
                  className="input input-bordered"
                />
              </div>

              {/* Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Phone</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={parent.phone || ""}
                  className="input input-bordered"
                />
              </div>

              {/* Occupation */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Occupation</span>
                </label>
                <input
                  type="text"
                  name="occupation"
                  defaultValue={parent.occupation || ""}
                  className="input input-bordered"
                />
              </div>

              {/* Relationship */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Relationship</span>
                </label>
                <select
                  name="relationship"
                  defaultValue={parent.relationship || ""}
                  className="select select-bordered"
                >
                  <option value="">Select relationship</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn btn-primary flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
                <Link
                  href={`/dashboard/parents/${id}`}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}