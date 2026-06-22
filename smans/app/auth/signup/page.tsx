// app/auth/signup/page.tsx
"use client";

import { signUpAction } from "@/app/actions/auth/signUp";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { GraduationCap, CheckCircle2, User, Mail, Lock, Phone, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Base schema without role-specific fields
const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["TEACHER", "STUDENT", "PARENT"]),
  phone: z.string().optional(),
});

// Student schema
const studentSchema = baseSchema.extend({
  admissionNumber: z.string().min(1, "Admission number is required"),
  classId: z.string().min(1, "Class is required"),
});

// Parent schema
const parentSchema = baseSchema.extend({
  occupation: z.string().optional(),
  relationship: z.string().optional(),
});

// Teacher schema
const teacherSchema = baseSchema.extend({
  staffNo: z.string().min(1, "Staff number is required"),
});

// Union type for all possible form data
type SignUpFormData = 
  | z.infer<typeof baseSchema>
  | z.infer<typeof studentSchema>
  | z.infer<typeof parentSchema>
  | z.infer<typeof teacherSchema>;

// Note: This is a client component, we'll fetch classes via API
export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string; level: string }[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER" | "PARENT">("STUDENT");

  // Fetch classes from API
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        if (res.ok) {
          const data = await res.json();
          setClasses(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, []);

  // Get the appropriate schema based on role
  const getSchema = (role: string) => {
    switch (role) {
      case "STUDENT":
        return studentSchema;
      case "PARENT":
        return parentSchema;
      case "TEACHER":
        return teacherSchema;
      default:
        return baseSchema;
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(getSchema(selectedRole)),
    defaultValues: { 
      role: "STUDENT",
      name: "",
      email: "",
      password: "",
      phone: "",
      admissionNumber: "",
      classId: "",
      occupation: "",
      relationship: "",
      staffNo: "",
    },
  });

  const watchedRole = watch("role");

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "role" && value.role) {
        setSelectedRole(value.role as "STUDENT" | "TEACHER" | "PARENT");
        // Reset role-specific fields when role changes
        setValue("admissionNumber", "");
        setValue("classId", "");
        setValue("occupation", "");
        setValue("relationship", "");
        setValue("staffNo", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      const signUpData: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
      };

      if (data.role === "STUDENT") {
        signUpData.admissionNumber = data.admissionNumber;
        signUpData.classId = data.classId;
      }

      if (data.role === "PARENT") {
        signUpData.occupation = data.occupation;
        signUpData.relationship = data.relationship;
      }

      if (data.role === "TEACHER") {
        signUpData.staffNo = data.staffNo;
      }

      const result = await signUpAction(signUpData);

      if (result.success) {
        setSuccess(true);
        reset();

        setTimeout(() => {
          router.push("/auth/login?success=account_created");
        }, 1500);
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-base-100">
      {/* Left Panel - Same as before */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-focus flex-col items-center justify-center p-16 text-primary-content relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="relative z-10 text-center max-w-sm">
          <GraduationCap className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-5xl font-black mb-4">SMANS</h1>
          <p className="text-lg opacity-80">School Management System</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-base-content/60 mt-1">First user becomes Administrator</p>
          </div>

          {success && (
            <div className="bg-success/10 border border-success text-success p-4 rounded-xl mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Account created successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error text-error p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label>Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <Input
                  placeholder="John Doe"
                  {...register("name")}
                  className="pl-10"
                />
              </div>
              {errors.name && <p className="text-error text-sm mt-1">{String(errors.name.message)}</p>}
            </div>

            <div>
              <Label>Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <Input
                  type="email"
                  placeholder="john@school.com"
                  {...register("email")}
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-error text-sm mt-1">{String(errors.email.message)}</p>}
            </div>

            <div>
              <Label>Phone Number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <Input
                  type="tel"
                  placeholder="+254 712 345 678"
                  {...register("phone")}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  {...register("password")}
                  className="pl-10"
                />
              </div>
              {errors.password && <p className="text-error text-sm mt-1">{String(errors.password.message)}</p>}
            </div>

            <div>
              <Label>Role</Label>
              <select 
                {...register("role")} 
                className="select select-bordered w-full mt-1"
                onChange={(e) => {
                  const newRole = e.target.value as "STUDENT" | "TEACHER" | "PARENT";
                  setSelectedRole(newRole);
                  setValue("admissionNumber", "");
                  setValue("classId", "");
                  setValue("occupation", "");
                  setValue("relationship", "");
                  setValue("staffNo", "");
                }}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>

            {/* Student-specific fields */}
            {selectedRole === "STUDENT" && (
              <>
                <div>
                  <Label>Admission Number *</Label>
                  <div className="relative mt-1">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                    <Input
                      placeholder="e.g. STU/001/2025"
                      {...register("admissionNumber")}
                      className="pl-10"
                    />
                  </div>
                  {errors.admissionNumber && <p className="text-error text-sm mt-1">{String(errors.admissionNumber.message)}</p>}
                </div>

                <div>
                  <Label>Class *</Label>
                  <select 
                    {...register("classId")} 
                    className="select select-bordered w-full mt-1"
                    disabled={loadingClasses}
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.level ? `(${cls.level})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.classId && <p className="text-error text-sm mt-1">{String(errors.classId.message)}</p>}
                  {loadingClasses && <p className="text-sm text-base-content/60 mt-1">Loading classes...</p>}
                  {!loadingClasses && classes.length === 0 && (
                    <p className="text-sm text-warning mt-1">
                      No classes available. Please contact the administrator.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Parent-specific fields */}
            {selectedRole === "PARENT" && (
              <>
                <div>
                  <Label>Occupation</Label>
                  <Input
                    placeholder="e.g. Teacher, Engineer, Doctor"
                    {...register("occupation")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Relationship to Children</Label>
                  <Input
                    placeholder="e.g. Father, Mother, Guardian"
                    {...register("relationship")}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {/* Teacher-specific fields. */}
            {selectedRole === "TEACHER" && (
              <div>
                <Label>Staff Number *</Label>
                <div className="relative mt-1">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                  <Input
                    placeholder="e.g. TCH/001/2025"
                    {...register("staffNo")}
                    className="pl-10"
                  />
                </div>
                {errors.staffNo && <p className="text-error text-sm mt-1">{String(errors.staffNo.message)}</p>}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}