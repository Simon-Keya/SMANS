"use client";

import { createInvoiceAction } from "@/app/actions/fees"; // ← your server action
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Toast } from "@/components/ui/Toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  studentId: z.string().min(1, "Select a student"),
  feeItemId: z.string().optional(),
  amount: z.number().min(1, "Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = Toast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      feeItemId: "",
      amount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createInvoiceAction({
        studentId: values.studentId,
        feeItemId: values.feeItemId || undefined,
        amount: values.amount,
        dueDate: new Date(values.dueDate),
        description: values.description,
      });

      toast({
        title: "Success",
        description: "Invoice created successfully.",
      });

      router.push("/dashboard/fees/invoices");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create invoice.",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Create New Invoice</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/fees/invoices">Back to Invoices</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student */}
              <div className="space-y-2">
                <Label htmlFor="studentId">Student</Label>
                <Select
                  onValueChange={(value) => form.setValue("studentId", value)}
                  defaultValue={form.watch("studentId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Populate from API or pass as prop in real app */}
                    <SelectItem value="student-1">John Doe</SelectItem>
                    <SelectItem value="student-2">Jane Smith</SelectItem>
                    {/* ... */}
                  </SelectContent>
                </Select>
                {form.formState.errors.studentId && (
                  <p className="text-sm text-error">{form.formState.errors.studentId.message}</p>
                )}
              </div>

              {/* Fee Item (optional) */}
              <div className="space-y-2">
                <Label htmlFor="feeItemId">Fee Item (optional)</Label>
                <Select
                  onValueChange={(value) => form.setValue("feeItemId", value)}
                  defaultValue={form.watch("feeItemId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {/* Populate in real app */}
                    <SelectItem value="fee-1">Tuition Fee</SelectItem>
                    <SelectItem value="fee-2">Exam Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KSh)</Label>
                <Input
                  id="amount"
                  type="number"
                  {...form.register("amount", { valueAsNumber: true })}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-error">{form.formState.errors.amount.message}</p>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...form.register("dueDate")}
                />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-error">{form.formState.errors.dueDate.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                {...form.register("description")}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/fees/invoices">Cancel</Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}