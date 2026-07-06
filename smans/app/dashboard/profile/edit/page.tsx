// app/dashboard/profile/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Hash,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  staffNo: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ✅ Updated to use /api/users/profile
        const response = await fetch("/api/users/profile");
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/auth/login");
            return;
          }
          throw new Error("Failed to fetch profile data");
        }

        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to fetch profile data");
        }

        setUser(result.data);
        setFormData({
          name: result.data.name || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }
      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
      };

      // ✅ Updated to use /api/users/profile
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ... rest of the component remains the same (the JSX part)
  // The JSX is the same as in the previous version

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-base-content/60">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="alert alert-error shadow-lg">
            <AlertCircle className="h-6 w-6" />
            <div>
              <h3 className="font-bold">Error Loading Profile</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-4 justify-center">
            <Link href="/dashboard/profile" className="btn btn-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
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

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="alert alert-error shadow-lg">
            <AlertCircle className="h-6 w-6" />
            <span>User not found</span>
          </div>
          <Link href="/dashboard/profile" className="btn btn-primary mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const initials = user.name
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
              href="/dashboard/profile"
              className="btn btn-ghost btn-sm gap-2 hover:bg-primary/10 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <span className="hidden sm:inline">User ID:</span>
              <code className="bg-base-300/50 px-2 py-1 rounded text-xs font-mono">
                {user.id.slice(0, 8)}...
              </code>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <User className="h-8 w-8" />
                Edit Profile
              </h1>
              <p className="text-base-content/60 mt-1">
                Update your personal information and account details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge badge-lg badge-outline gap-2">
                <Shield className="h-4 w-4" />
                {user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success mb-6 shadow-lg">
            <CheckCircle className="h-6 w-6" />
            <span>Profile updated successfully!</span>
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
          {/* Sidebar - User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-base-200 rounded-2xl p-6 border border-base-300 sticky top-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-primary-content">
                    {initials}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-base-content/60">{user.role}</p>
              </div>

              <div className="divider my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-base-100/50">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-base-100/50">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.staffNo && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-base-100/50">
                    <Hash className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{user.staffNo}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-base-100/50 text-base-content/60">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="divider my-4" />

              <div className="text-center text-xs text-base-content/60">
                <p>Member since</p>
                <p className="font-medium text-base-content">
                  {new Date(user.createdAt).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-base-200 rounded-2xl p-6 md:p-8 border border-base-300 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Name */}
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
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Email Address <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input input-bordered w-full focus:input-primary transition-all duration-200"
                      placeholder="your@email.com"
                      required
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
                      value={formData.phone}
                      onChange={handleChange}
                      className="input input-bordered w-full focus:input-primary transition-all duration-200"
                      placeholder="+254 700 000 000"
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/40">
                        Primary contact number
                      </span>
                    </label>
                  </div>

                  {/* Staff Number (Read-only) */}
                  {user.staffNo && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-2 text-base-content/60">
                          <Hash className="h-4 w-4" />
                          Staff Number
                        </span>
                      </label>
                      <input
                        type="text"
                        value={user.staffNo}
                        className="input input-bordered w-full bg-base-300/50 cursor-not-allowed"
                        disabled
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/40">
                          Staff number cannot be changed
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Role (Read-only) */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2 text-base-content/60">
                        <Shield className="h-4 w-4" />
                        Role
                      </span>
                    </label>
                    <input
                      type="text"
                      value={user.role}
                      className="input input-bordered w-full bg-base-300/50 cursor-not-allowed capitalize"
                      disabled
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/40">
                        Role cannot be changed here
                      </span>
                    </label>
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
                      href="/dashboard/profile"
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
                Account Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/profile"
                  className="btn btn-sm btn-outline gap-2"
                >
                  <User className="h-4 w-4" />
                  View Profile
                </Link>
                <Link
                  href="/dashboard/settings/security"
                  className="btn btn-sm btn-outline gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Security Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}