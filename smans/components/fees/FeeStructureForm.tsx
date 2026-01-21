// components/fees/FeeStructureForm.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const feeItemSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  frequency: z.enum(["once", "monthly", "termly", "yearly"]),
  description: z.string().optional(),
});

type FeeItemFormData = z.infer<typeof feeItemSchema>;

interface FeeStructureFormProps {
  feeItem?: {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    description?: string | null;
  };
}

export default function FeeStructureForm({ feeItem }: FeeStructureFormProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!feeItem;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeeItemFormData>({
    resolver: zodResolver(feeItemSchema),
    defaultValues: feeItem
      ? {
          name: feeItem.name,
          amount: feeItem.amount,
          frequency: feeItem.frequency as any,
          description: feeItem.description ?? "",
        }
      : {
          name: "",
          amount: 0,
          frequency: "termly",
          description: "",
        },
  });

  const onSubmit = async (data: FeeItemFormData) => {
    startTransition(async () => {
      try {
        const res = await fetch(isEdit ? `/api/fees/structure/${feeItem?.id}` : "/api/fees/structure", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to save fee item");

        router.push("/dashboard/fees/structure");
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to save fee structure item");
      }
    });
  };

  return (
    <Card className="bg-base-100 shadow-lg border-base-200">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Fee Item Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Tuition Fee, Exam Fee"
                {...register("name")}
                disabled={isPending}
              />
              {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KSh) *</Label>
              <Input
                id="amount"
                type="number"
                {...register("amount", { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.amount && <p className="text-sm text-error">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                onValueChange={(val) => setValue("frequency", val as any)}
                defaultValue={feeItem?.frequency || "termly"}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="termly">Termly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {errors.frequency && <p className="text-sm text-error">{errors.frequency.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="e.g. Annual tuition for Grade 1-8"
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
                "Update Fee Item"
              ) : (
                "Add Fee Item"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}