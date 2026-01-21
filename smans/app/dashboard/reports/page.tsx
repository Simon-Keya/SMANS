import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { BarChart3, BookOpen, CalendarCheck, DollarSign } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ReportsDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardLink
          href="/dashboard/reports/attendance"
          icon={<CalendarCheck className="h-8 w-8 text-primary" />}
          title="Attendance"
          description="Daily, weekly, and monthly attendance reports"
        />
        <CardLink
          href="/dashboard/reports/grades"
          icon={<BookOpen className="h-8 w-8 text-primary" />}
          title="Academic Performance"
          description="Grades, averages, and student progress analytics"
        />
        <CardLink
          href="/dashboard/reports/finance"
          icon={<DollarSign className="h-8 w-8 text-primary" />}
          title="Finance"
          description="Fee collection, payments, and financial summaries"
        />
        <CardLink
          href="/dashboard/reports/overview"
          icon={<BarChart3 className="h-8 w-8 text-primary" />}
          title="Overall Analytics"
          description="School-wide performance and trends"
        />
      </div>
    </div>
  );
}

function CardLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-xl transition-all border border-base-200 bg-base-100">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <CardTitle className="text-xl text-primary">{title}</CardTitle>
            <p className="text-sm text-base-content/70">{description}</p>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}