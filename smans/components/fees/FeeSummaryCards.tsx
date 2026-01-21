// components/fees/FeeSummaryCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlertCircle, CreditCard, DollarSign } from "lucide-react";

interface FeeSummaryProps {
  totalDue: number;
  totalPaid: number;
  overdue: number;
}

export default function FeeSummaryCards({ totalDue, totalPaid, overdue }: FeeSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-base-100 shadow-lg border-base-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">Total Due</CardTitle>
          <DollarSign className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            KSh {totalDue.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-base-100 shadow-lg border-base-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">Total Paid</CardTitle>
          <CreditCard className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            KSh {totalPaid.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-base-100 shadow-lg border-base-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">Overdue</CardTitle>
          <AlertCircle className="h-5 w-5 text-error" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-error">{overdue}</div>
        </CardContent>
      </Card>
    </div>
  );
}