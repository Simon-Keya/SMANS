// app/dashboard/fees/invoices/new/page.tsx
"use client";

import { createInvoiceAction } from "@/app/actions/fees/createInvoice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

const formSchema = z.object({
  studentId: z.string().min(1, "Select a student"),
  feeItemId: z.string().optional(),
  amount: z.number().min(1, "Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewInvoicePage() {
  const router = useRouter();
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [feeItems, setFeeItems] = useState<{ id: string; name: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch students and fee items
  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, feeItemsRes] = await Promise.all([
          fetch("/api/students").then(res => res.json()),
          fetch("/api/fees/structure").then(res => res.json()),
        ]);
        setStudents(studentsRes.data || []);
        setFeeItems(feeItemsRes || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      feeItemId: "",
      amount: 0,
      dueDate: new Date().toISOString().split("T")[0],
    },
  });

  const selectedFeeItemId = form.watch("feeItemId");

  // Auto-populate amount when fee item is selected
  useEffect(() => {
    if (selectedFeeItemId) {
      const selectedFeeItem = feeItems.find(item => item.id === selectedFeeItemId);
      if (selectedFeeItem) {
        form.setValue("amount", selectedFeeItem.amount);
      }
    }
  }, [selectedFeeItemId, feeItems, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await createInvoiceAction({
        studentId: values.studentId,
        feeItemId: values.feeItemId || undefined,
        amount: values.amount,
        dueDate: new Date(values.dueDate),
      });

      toast.success("Invoice created successfully!");
      router.push("/dashboard/fees/invoices");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create invoice.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Create New Invoice</h1>
          <p className="text-muted-foreground mt-1">Generate an invoice for a student</p>
        </div>
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
              <div className="space-y-2">
                <Label htmlFor="studentId">Student</Label>
                <Select
                  onValueChange={(value) => form.setValue("studentId", value)}
                  value={form.watch("studentId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.studentId && (
                  <p className="text-sm text-destructive">{form.formState.errors.studentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeItemId">Fee Item (optional)</Label>
                <Select
                  onValueChange={(value) => form.setValue("feeItemId", value)}
                  value={form.watch("feeItemId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Custom amount</SelectItem>
                    {feeItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} (KSh {item.amount.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...form.register("dueDate")}
                />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.dueDate.message}</p>
                )}
              </div>
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