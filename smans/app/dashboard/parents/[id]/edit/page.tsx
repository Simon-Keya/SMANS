// app/dashboard/parents/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
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

interface ParentData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  occupation: string | null;
  relationship: string | null;
  userId: string | null;
  students: any[];
  user: any | null;
  studentCount: number;
}

export default function EditParentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [parent, setParent] = useState<ParentData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
    relationship: "",
  });

  // Resolve params
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Simplified helper function to find parent
  const findParent = async (id: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      // Attempt 1: Try to fetch by Parent ID directly
      console.log("🔍 Attempt 1: Fetching parent with ID as Parent ID:", id);
      const response = await fetch(`/api/parents/${id}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log("✅ Parent found by ID:", id);
          return { success: true, data: result.data };
        }
      }

      // If we got a 404, the ID might be a User ID
      if (response.status === 404) {
        console.log("🔍 Attempt 2: ID not found as Parent ID, checking if it's a User ID...");
        
        // Try to find the parent by userId using a different approach
        // Fetch all parents and check if any have this userId
        try {
          const allParentsResponse = await fetch('/api/parents');
          if (allParentsResponse.ok) {
            const allParents = await allParentsResponse.json();
            if (allParents.success && allParents.data) {
              // Find the parent with matching userId
              const parent = allParents.data.find((p: any) => p.userId === id);
              if (parent) {
                console.log("✅ Parent found by User ID:", parent.id);
                // Now fetch the parent by its correct Parent ID
                const parentResponse = await fetch(`/api/parents/${parent.id}`);
                if (parentResponse.ok) {
                  const parentResult = await parentResponse.json();
                  if (parentResult.success && parentResult.data) {
                    return { success: true, data: parentResult.data };
                  }
                }
              }
            }
          }
        } catch (err) {
          console.log("⚠️ Could not fetch all parents:", err);
        }
      }

      return { success: false, error: "Parent not found" };
    } catch (error) {
      console.error("❌ Error finding parent:", error);
      return { success: false, error: "Failed to find parent" };
    }
  };

  // Fetch parent data with workaround
  useEffect(() => {
    if (!resolvedParams?.id) return;

    const fetchParent = async () => {
      try {
        const { id } = resolvedParams;
        
        console.log("🔍 Fetching parent with ID:", id);
        
        // Use the helper function to find the parent
        const result = await findParent(id);
        
        if (!result.success || !result.data) {
          throw new Error(result.error || "Parent not found. Please check the ID is correct.");
        }

        console.log("✅ Parent data loaded:", result.data);
        console.log("✅ Parent ID (use this for updates):", result.data.id);
        
        setParent(result.data);
        setFormData({
          name: result.data.name || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          occupation: result.data.occupation || "",
          relationship: result.data.relationship || "",
        });
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load parent data");
      } finally {
        setLoading(false);
      }
    };

    fetchParent();
  }, [resolvedParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!resolvedParams?.id) {
        throw new Error("Invalid parent ID");
      }

      // Use the actual parent ID from the loaded parent data
      // This ensures we always use the correct Parent ID
      const parentId = parent?.id || resolvedParams.id;
      
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }
      if (!formData.phone.trim()) {
        throw new Error("Phone number is required");
      }

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        occupation: formData.occupation.trim() || null,
        relationship: formData.relationship || null,
      };

      console.log("📤 Sending PUT request to /api/parents/" + parentId);
      console.log("📤 Data:", updateData);

      const response = await fetch(`/api/parents/${parentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      console.log("📥 Response status:", response.status);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to update parent: ${response.status}`);
      }

      console.log("✅ Parent updated successfully:", result);
      setSuccess(true);
      
      // Redirect to the parent detail page using the correct Parent ID
      setTimeout(() => {
        router.push(`/dashboard/parents/${parentId}`);
      }, 1500);
    } catch (err) {
      console.error("❌ Update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update parent");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-8 bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-base-content/60">Loading parent data...</p>
        </div>
      </div>
    );
  }

  if (error && !parent) {
    return (
      <div className="min-h-screen p-6 md:p-8 bg-base-100">
        <div className="max-w-3xl mx-auto">
          <div className="alert alert-error shadow-lg">
            <AlertCircle className="h-6 w-6" />
            <div>
              <h3 className="font-bold">Error Loading Parent</h3>
              <p className="text-sm">{error}</p>
              <p className="text-xs text-base-content/60 mt-1">
                ID attempted: {resolvedParams?.id || "unknown"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <Link href="/dashboard/parents" className="btn btn-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Parents
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-ghost"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="min-h-screen p-6 md:p-8 bg-base-100">
        <div className="max-w-3xl mx-auto">
          <div className="alert alert-error shadow-lg">
            <AlertCircle className="h-6 w-6" />
            <span>Parent not found</span>
          </div>
          <Link href="/dashboard/parents" className="btn btn-primary mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parents
          </Link>
        </div>
      </div>
    );
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
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/dashboard/parents/${parent.id}`}
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
                {parent.studentCount} Children
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

        {/* Success Message */}
        {success && (
          <div className="alert alert-success mb-6 shadow-lg">
            <CheckCircle className="h-6 w-6" />
            <span>Parent information updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-6 shadow-lg">
            <AlertCircle className="h-6 w-6" />
            <span>{error}</span>
            <button
              className="btn btn-sm btn-ghost ml-auto"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

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
                <p className="text-3xl font-bold text-primary">{parent.studentCount}</p>
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

              <form onSubmit={handleSubmit}>
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
                      value={formData.name}
                      onChange={handleChange}
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
                      value={formData.email}
                      onChange={handleChange}
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
                      value={formData.phone}
                      onChange={handleChange}
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
                        value={formData.occupation}
                        onChange={handleChange}
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
                        value={formData.relationship}
                        onChange={handleChange}
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
                      disabled={saving}
                      className="btn btn-primary flex-1 gap-2 hover:scale-[1.02] transition-transform duration-200 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <Link
                      href={`/dashboard/parents/${parent.id}`}
                      className="btn btn-ghost flex-1 hover:bg-error/10 hover:text-error transition-all duration-200"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Link>
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