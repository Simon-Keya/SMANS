import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";


export default async function GradesReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Example: average grade per class (customize as needed)
  const averageGrades = await prisma.grade.groupBy({
    by: ["classId"],
    _avg: { score: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Grades & Performance Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">A- Average</p>
            <p className="text-sm text-base-content/60">School-wide average</p>
          </CardContent>
        </Card>

        {/* Add class-wise, student-wise, subject-wise breakdowns */}
      </div>
    </div>
  );
}