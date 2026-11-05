"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { getQualitativeReportAction } from "@/app/actions/cbc/curriculum";

type Student = { id: string; name: string | null; admissionNumber: string };

export function ReportClient({ students }: { students: Student[] }) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [term, setTerm] = useState("Term 1");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!studentId) return;
    setLoading(true);
    setError("");
    try {
      const report = await getQualitativeReportAction(studentId, term, year);
      setData(report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label>Student</Label>
          <select
            className="select select-bordered"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.admissionNumber})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Term</Label>
          <input
            className="input input-bordered"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <div>
          <Label>Year</Label>
          <input
            type="number"
            className="input input-bordered w-28"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
        <Button onClick={load} disabled={loading || !studentId}>
          {loading ? "Loading..." : "Load report"}
        </Button>
      </div>

      {error && (
        <div className="text-error text-sm rounded-xl border border-error/30 px-4 py-3">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <section className="rounded-xl border p-4">
            <h2 className="font-semibold mb-3">Outcome assessments</h2>
            {data.assessments?.length ? (
              <ul className="space-y-2 text-sm">
                {data.assessments.map((a: any) => (
                  <li key={a.id} className="border-b border-base-300 pb-2">
                    <span className="badge badge-outline mr-2">
                      {a.competencyLevel?.code}
                    </span>
                    {a.outcome?.description}
                    {a.comments && (
                      <p className="text-muted-foreground mt-1">{a.comments}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No assessments for this term.</p>
            )}
          </section>

          <section className="rounded-xl border p-4">
            <h2 className="font-semibold mb-3">Observations</h2>
            {data.observations?.length ? (
              <ul className="space-y-2 text-sm">
                {data.observations.map((o: any) => (
                  <li key={o.id}>
                    <span className="text-muted-foreground text-xs">
                      {new Date(o.observedAt).toLocaleDateString()}
                    </span>
                    <p>{o.notes}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No observations yet.</p>
            )}
          </section>

          <section className="rounded-xl border p-4">
            <h2 className="font-semibold mb-3">Open interventions</h2>
            {data.interventions?.length ? (
              <ul className="space-y-2 text-sm">
                {data.interventions.map((i: any) => (
                  <li key={i.id}>
                    <strong>{i.title}</strong>
                    {i.description && <p>{i.description}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">None open.</p>
            )}
          </section>

          <section className="rounded-xl border p-4">
            <h2 className="font-semibold mb-3">Portfolio</h2>
            {data.portfolio?.length ? (
              <ul className="space-y-2 text-sm">
                {data.portfolio.map((p: any) => (
                  <li key={p.id}>
                    <strong>{p.title}</strong>
                    {p.description && <p>{p.description}</p>}
                    {p.fileUrl && (
                      <a className="link link-primary text-xs" href={p.fileUrl}>
                        View file
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No portfolio items.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
