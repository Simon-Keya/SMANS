"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const parentSchema = z.object({
  name: z.string().min(2, "Name is required").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase(),
  phone: z.string().min(9, "Phone too short").optional(),
  occupation: z.string().optional(),
  relationship: z.string().min(2, "Relationship is required").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(), // only for create
});

type ParentFormData = z.infer<typeof parentSchema> & { id?: string };

interface ParentFormProps {
  parent?: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
    occupation?: string | null;
    relationship?: string | null;
  };
}

export default function ParentForm({ parent }: ParentFormProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!parent;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      name: parent?.name ?? "",
      email: parent?.email ?? "",
      phone: parent?.phone ?? "",
      occupation: parent?.occupation ?? "",
      relationship: parent?.relationship ?? "",
      password: "",
    },
  });

  const onSubmit = async (data: ParentFormData) => {
    startTransition(async () => {
      try {
        let res: Response;

        if (isEdit) {
          // Remove password from update payload
          const { password, ...updateData } = data;
          res = await fetch(`/api/parents/${parent?.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          });
        } else {
          res = await fetch("/api/parents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Operation failed");
        }

        router.push("/dashboard/parents");
        router.refresh();
      } catch (err: any) {
        console.error("Parent save error:", err);
        alert(err.message || "Failed to save parent. Please try again.");
      }
    });
  };

  return (
    <Card className="border-base-200 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...register("name")} disabled={isPending} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" {...register("email")} disabled={isPending} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input id="phone" type="tel" {...register("phone")} disabled={isPending} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation (Optional)</Label>
              <Input id="occupation" {...register("occupation")} disabled={isPending} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship (e.g. Mother, Father, Guardian) *</Label>
              <Input id="relationship" {...register("relationship")} disabled={isPending} />
              {errors.relationship && (
                <p className="text-sm text-destructive">{errors.relationship.message}</p>
              )}
            </div>

            {!isEdit && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Initial Password *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={isPending}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Parent"
              ) : (
                "Create Parent"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}