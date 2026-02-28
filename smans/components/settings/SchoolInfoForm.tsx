// components/settings/SchoolInfoForm.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

const schoolSchema = z.object({
  name: z.string().min(2, "School name is required"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(9, "Phone number is required"),
  email: z.string().email("Invalid email"),
  logoUrl: z.string().url("Invalid URL").optional(),
  academicYearStart: z.string().min(1),
  academicYearEnd: z.string().min(1),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

export default function SchoolInfoForm() {
  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "SMANS School",
      address: "Nairobi, Kenya",
      phone: "+254700000000",
      email: "info@smans.co.ke",
      logoUrl: "",
      academicYearStart: "2026-01-01",
      academicYearEnd: "2026-12-31",
    },
  });

  const onSubmit = async (data: SchoolFormData) => {
    try {
      const res = await fetch("/api/settings/school", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("School settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>School Name</Label>
          <Input {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...form.register("email")} />
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input {...form.register("phone")} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Address</Label>
          <Textarea {...form.register("address")} />
        </div>

        <div className="space-y-2">
          <Label>Academic Year Start</Label>
          <Input type="date" {...form.register("academicYearStart")} />
        </div>

        <div className="space-y-2">
          <Label>Academic Year End</Label>
          <Input type="date" {...form.register("academicYearEnd")} />
        </div>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}