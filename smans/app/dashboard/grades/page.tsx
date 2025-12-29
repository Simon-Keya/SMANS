import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function GradesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Grades</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/grades/enter">Enter New Grades</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}