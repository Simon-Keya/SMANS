"use client";

import { createFeeItemAction } from "@/app/actions/fees/createFeeItem";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Toast, ToastDescription, ToastTitle } from "@/components/ui/Toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";


const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(1, "Amount must be positive"),
  frequency: z.enum(["ONCE", "MONTHLY", "TERM", "YEARLY"]),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewFeeItemPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      frequency: "TERM",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createFeeItemAction(values);

      // Correct toast usage
      <Toast>
        <ToastTitle>Success</ToastTitle>
        <ToastDescription>Fee item created successfully.</ToastDescription>
      </Toast>;

      router.push("/dashboard/fees/structure");
      router.refresh();
    } catch (error: any) {
      <Toast variant="destructive">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>{error.message || "Failed to create fee item."}</ToastDescription>
      </Toast>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Add New Fee Item</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/fees/structure">Back to Fee Structure</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KSh)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...form.register("amount", { valueAsNumber: true })}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  onValueChange={(value) => form.setValue("frequency", value as any)}
                  value={form.watch("frequency")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONCE">Once</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="TERM">Per Term</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input id="description" {...form.register("description")} />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/fees/structure">Cancel</Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Add Fee Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}