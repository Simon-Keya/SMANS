// components/notifications/NotificationForm.tsx
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

const notificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  recipientIds: z.array(z.string()).optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function NotificationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      recipientIds: [],
    },
  });

  const onSubmit = async (data: NotificationFormData) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to send");

        router.push("/dashboard/notifications");
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to send notification");
      }
    });
  };

  return (
    <Card className="bg-base-100 shadow-lg border-base-200">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Exam Results Released" {...register("title")} />
            {errors.title && <p className="text-sm text-error">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Dear students, your mid-term results are now available..."
              rows={5}
              {...register("message")}
            />
            {errors.message && <p className="text-sm text-error">{errors.message.message}</p>}
          </div>

          {/* Optional: recipient selector - can be expanded later */}
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
                  Sending...
                </>
              ) : (
                "Send Notification"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}