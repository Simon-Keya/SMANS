"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  createCurriculumVersionAction,
  createGradeLevelAction,
  createLearningAreaAction,
  createStrandAction,
  createSubStrandAction,
  createOutcomeAction,
} from "@/app/actions/cbc/curriculum";

type Version = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  gradeLevels: Array<{
    id: string;
    name: string;
    code: string;
    learningAreas: Array<{
      id: string;
      name: string;
      strands: Array<{
        id: string;
        name: string;
        subStrands: Array<{
          id: string;
          name: string;
          outcomes: Array<{ id: string; description: string }>;
        }>;
      }>;
    }>;
  }>;
};

export function CurriculumClient({
  initialVersions,
  canWrite,
}: {
  initialVersions: Version[];
  canWrite: boolean;
}) {
  const [versions, setVersions] = useState(initialVersions);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Hierarchy form state
  const [versionId, setVersionId] = useState("");
  const [gradeName, setGradeName] = useState("");
  const [gradeCode, setGradeCode] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [areaName, setAreaName] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [learningAreaId, setLearningAreaId] = useState("");
  const [strandName, setStrandName] = useState("");
  const [strandId, setStrandId] = useState("");
  const [subName, setSubName] = useState("");
  const [subStrandId, setSubStrandId] = useState("");
  const [outcomeDesc, setOutcomeDesc] = useState("");

  const refreshMsg = (m: string) => {
    setMsg(m);
    setError("");
  };

  const onCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    setLoading(true);
    try {
      const v = await createCurriculumVersionAction({ name, code });
      setVersions((prev) => [
        {
          id: v.id,
          name: v.name,
          code: v.code,
          description: v.description,
          isActive: v.isActive,
          gradeLevels: [],
        },
        ...prev,
      ]);
      setName("");
      setCode("");
      refreshMsg("Version created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const allGrades = versions.flatMap((v) =>
    v.gradeLevels.map((g) => ({ ...g, versionId: v.id, versionName: v.name }))
  );
  const allAreas = allGrades.flatMap((g) =>
    g.learningAreas.map((a) => ({ ...a, gradeLevelId: g.id }))
  );
  const allStrands = allAreas.flatMap((a) =>
    a.strands.map((s) => ({ ...s, learningAreaId: a.id }))
  );
  const allSubs = allStrands.flatMap((s) =>
    s.subStrands.map((ss) => ({ ...ss, strandId: s.id }))
  );

  return (
    <div className="space-y-8">
      {msg && <p className="text-success text-sm">{msg}</p>}
      {error && <p className="text-error text-sm">{error}</p>}

      {canWrite && (
        <>
          <form
            onSubmit={onCreateVersion}
            className="rounded-xl border p-4 grid gap-3 sm:grid-cols-3 items-end"
          >
            <div>
              <Label>Version name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>
              Add version
            </Button>
          </form>

          <div className="grid gap-4 lg:grid-cols-2">
            <form
              className="rounded-xl border p-4 space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await createGradeLevelAction({
                    curriculumVersionId: versionId,
                    name: gradeName,
                    code: gradeCode,
                  });
                  refreshMsg("Grade level created — reload page to see tree");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <h3 className="font-semibold">Add grade level</h3>
              <select
                className="select select-bordered w-full"
                value={versionId}
                onChange={(e) => setVersionId(e.target.value)}
                required
              >
                <option value="">Version</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Grade 4"
                value={gradeName}
                onChange={(e) => setGradeName(e.target.value)}
                required
              />
              <Input
                placeholder="G4"
                value={gradeCode}
                onChange={(e) => setGradeCode(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                Add grade
              </Button>
            </form>

            <form
              className="rounded-xl border p-4 space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await createLearningAreaAction({
                    gradeLevelId,
                    name: areaName,
                    code: areaCode || undefined,
                  });
                  refreshMsg("Learning area created — reload page");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <h3 className="font-semibold">Add learning area</h3>
              <select
                className="select select-bordered w-full"
                value={gradeLevelId}
                onChange={(e) => setGradeLevelId(e.target.value)}
                required
              >
                <option value="">Grade level</option>
                {allGrades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.code})
                  </option>
                ))}
              </select>
              <Input
                placeholder="Mathematics"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                required
              />
              <Input
                placeholder="MATH"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
              />
              <Button type="submit" disabled={loading}>
                Add learning area
              </Button>
            </form>

            <form
              className="rounded-xl border p-4 space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await createStrandAction({
                    learningAreaId,
                    name: strandName,
                  });
                  refreshMsg("Strand created — reload page");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <h3 className="font-semibold">Add strand</h3>
              <select
                className="select select-bordered w-full"
                value={learningAreaId}
                onChange={(e) => setLearningAreaId(e.target.value)}
                required
              >
                <option value="">Learning area</option>
                {allAreas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Numbers"
                value={strandName}
                onChange={(e) => setStrandName(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                Add strand
              </Button>
            </form>

            <form
              className="rounded-xl border p-4 space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await createSubStrandAction({ strandId, name: subName });
                  refreshMsg("Sub-strand created — reload page");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <h3 className="font-semibold">Add sub-strand</h3>
              <select
                className="select select-bordered w-full"
                value={strandId}
                onChange={(e) => setStrandId(e.target.value)}
                required
              >
                <option value="">Strand</option>
                {allStrands.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Whole numbers"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                Add sub-strand
              </Button>
            </form>

            <form
              className="rounded-xl border p-4 space-y-2 lg:col-span-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await createOutcomeAction({
                    subStrandId,
                    description: outcomeDesc,
                  });
                  refreshMsg("Outcome created — reload page");
                  setOutcomeDesc("");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <h3 className="font-semibold">Add outcome</h3>
              <select
                className="select select-bordered w-full"
                value={subStrandId}
                onChange={(e) => setSubStrandId(e.target.value)}
                required
              >
                <option value="">Sub-strand</option>
                {allSubs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Learner is able to..."
                value={outcomeDesc}
                onChange={(e) => setOutcomeDesc(e.target.value)}
                required
                rows={3}
              />
              <Button type="submit" disabled={loading}>
                Add outcome
              </Button>
            </form>
          </div>
        </>
      )}

      {versions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No curriculum versions yet. Create one or run{" "}
          <code>npx ts-node scripts/seed-cbc.ts</code>.
        </p>
      ) : (
        <ul className="space-y-4">
          {versions.map((v) => (
            <li key={v.id} className="rounded-xl border p-4">
              <div className="flex justify-between">
                <h3 className="font-semibold">
                  {v.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({v.code})
                  </span>
                </h3>
                <span
                  className={`badge ${v.isActive ? "badge-success" : "badge-ghost"}`}
                >
                  {v.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <ul className="mt-2 pl-4 text-sm space-y-1">
                {v.gradeLevels.map((g) => (
                  <li key={g.id}>
                    <strong>
                      {g.name} ({g.code})
                    </strong>
                    <ul className="pl-4">
                      {g.learningAreas.map((a) => (
                        <li key={a.id}>
                          {a.name}
                          <ul className="pl-4">
                            {a.strands.map((s) => (
                              <li key={s.id}>
                                Strand: {s.name}
                                <ul className="pl-4">
                                  {s.subStrands.map((ss) => (
                                    <li key={ss.id}>
                                      {ss.name} — {ss.outcomes.length} outcome(s)
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
