// app/dashboard/curriculum/page.tsx
import { authOptions } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { CbcService } from "@/lib/services/cbc.service";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CurriculumClient } from "./CurriculumClient";

export default async function CurriculumPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const role = session.user.role as any;
  const canRead =
    hasPermission(role, "curriculum:read") ||
    hasPermission(role, "grades:read") ||
    role === "ADMIN";
  if (!canRead) redirect("/dashboard");

  let versions: Awaited<ReturnType<typeof CbcService.listCurriculumVersions>> = [];
  let scale: Awaited<ReturnType<typeof CbcService.getDefaultScale>> | null = null;
  let loadError: string | null = null;

  try {
    // Tables may not exist until migrate is applied
    versions = await CbcService.listCurriculumVersions();
    scale = await CbcService.getDefaultScale();
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "CBC tables not available. Run prisma migrate deploy.";
  }

  const canWrite =
    hasPermission(role, "curriculum:write") || role === "ADMIN";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">CBC Curriculum</h1>
        <p className="text-muted-foreground mt-1">
          Version → grade level → learning area → strand → sub-strand → outcome
        </p>
      </div>

      {loadError && (
        <div className="rounded-xl border border-warning bg-warning/10 px-4 py-3 text-sm">
          {loadError}
        </div>
      )}

      {scale && (
        <div className="rounded-xl border bg-base-200 p-4">
          <h2 className="font-semibold mb-2">
            Competency scale: {scale.name} ({scale.code})
          </h2>
          <div className="flex flex-wrap gap-2">
            {scale.levels.map((l) => (
              <span
                key={l.id}
                className="badge badge-outline gap-1"
                title={l.description ?? undefined}
              >
                <strong>{l.code}</strong> {l.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Levels are loaded from the database — not hardcoded in application
            logic.
          </p>
        </div>
      )}

      <CurriculumClient
        initialVersions={JSON.parse(JSON.stringify(versions))}
        canWrite={canWrite}
      />
    </div>
  );
}
