// components/subjects/SubjectForm.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const subjectSchema = z.object({
  name: z.string().min(2, "Name is required").trim(),
  code: z.string().min(2, "Code is required").trim().toUpperCase(),
  description: z.string().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  subject?: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
  };
}

export default function SubjectForm({ subject }: SubjectFormProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!subject;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: subject
      ? {
          name: subject.name,
          code: subject.code,
          description: subject.description ?? "",
        }
      : {
          name: "",
          code: "",
          description: "",
        },
  });

  const onSubmit = async (data: SubjectFormData) => {
    startTransition(async () => {
      try {
        const res = await fetch(isEdit ? `/api/subjects/${subject?.id}` : "/api/subjects", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed");
        }

        router.push("/dashboard/subjects");
        router.refresh();
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to save subject");
      }
    });
  };

  return (
    <Card className="bg-base-100 shadow-lg border-base-200">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Mathematics"
                {...register("name")}
                disabled={isPending}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                placeholder="e.g. MAT101"
                {...register("code")}
                disabled={isPending}
              />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the subject..."
                rows={3}
                {...register("description")}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
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
                "Update Subject"
              ) : (
                "Create Subject"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}