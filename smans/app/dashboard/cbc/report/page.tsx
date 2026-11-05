import { authOptions } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReportClient } from "./ReportClient";

export default async function QualitativeReportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const role = session.user.role as any;
  const canRead =
    hasPermission(role, "reports:read") ||
    hasPermission(role, "grades:read") ||
    role === "ADMIN" ||
    role === "PARENT" ||
    role === "STUDENT";
  if (!canRead) redirect("/dashboard");

  let students: { id: string; name: string | null; admissionNumber: string }[] =
    [];

  try {
    if (role === "STUDENT") {
      const me = await prisma.student.findFirst({
        where: { userId: session.user.id },
        select: { id: true, name: true, admissionNumber: true },
      });
      students = me ? [me] : [];
    } else if (role === "PARENT") {
      const parent = await prisma.parent.findFirst({
        where: { userId: session.user.id },
        include: {
          students: {
            select: { id: true, name: true, admissionNumber: true },
          },
        },
      });
      students = parent?.students ?? [];
    } else {
      students = await prisma.student.findMany({
        select: { id: true, name: true, admissionNumber: true },
        orderBy: { name: "asc" },
        take: 200,
      });
    }
  } catch {
    students = [];
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Qualitative report card
        </h1>
        <p className="text-muted-foreground mt-1">
          Outcome levels, observations, interventions, and portfolio evidence —
          not percentage averages alone.
        </p>
      </div>
      <ReportClient students={students} />
    </div>
  );
}
