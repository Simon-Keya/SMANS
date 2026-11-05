// Teacher: record CBC outcome assessments using DB competency levels
import { authOptions } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { CbcService } from "@/lib/services/cbc.service";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AssessClient } from "./AssessClient";

export default async function CbcAssessPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const role = session.user.role as any;
  if (!hasPermission(role, "grades:enter") && role !== "ADMIN") {
    redirect("/dashboard");
  }

  let levels: { id: string; code: string; label: string }[] = [];
  let students: { id: string; name: string | null; admissionNumber: string }[] = [];
  let outcomes: { id: string; description: string; code: string | null }[] = [];
  let error: string | null = null;

  try {
    const scale = await CbcService.getDefaultScale();
    levels = scale.levels.map((l) => ({
      id: l.id,
      code: l.code,
      label: l.label,
    }));
    students = await prisma.student.findMany({
      select: { id: true, name: true, admissionNumber: true },
      orderBy: { name: "asc" },
      take: 200,
    });
    outcomes = await prisma.outcome.findMany({
      select: { id: true, description: true, code: true },
      orderBy: { orderIndex: "asc" },
      take: 500,
    });
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "CBC data unavailable. Apply migrations and seed curriculum.";
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">CBC Outcome Assessment</h1>
        <p className="text-muted-foreground mt-1">
          Record learner performance against outcomes using the configured
          competency scale (not hardcoded thresholds).
        </p>
      </div>
      {error && (
        <div className="rounded-xl border border-warning bg-warning/10 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <AssessClient
        levels={levels}
        students={students}
        outcomes={outcomes}
      />
    </div>
  );
}
