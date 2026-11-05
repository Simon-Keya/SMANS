"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { recordOutcomeAssessmentAction, addObservationAction } from "@/app/actions/cbc/curriculum";

type Level = { id: string; code: string; label: string };
type Student = { id: string; name: string | null; admissionNumber: string };
type Outcome = { id: string; description: string; code: string | null };

export function AssessClient({
  levels,
  students,
  outcomes,
}: {
  levels: Level[];
  students: Student[];
  outcomes: Outcome[];
}) {
  const [studentId, setStudentId] = useState("");
  const [outcomeId, setOutcomeId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [comments, setComments] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [year, setYear] = useState(new Date().getFullYear());
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      await recordOutcomeAssessmentAction({
        studentId,
        outcomeId,
        competencyLevelId: levelId,
        comments: comments || undefined,
        term,
        year,
      });
      setMsg("Outcome assessment saved.");
      setComments("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save assessment");
    } finally {
      setLoading(false);
    }
  };

  const submitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      await addObservationAction({
        studentId,
        notes,
        outcomeId: outcomeId || undefined,
        competencyLevelId: levelId || undefined,
      });
      setMsg("Observation recorded.");
      setNotes("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save observation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={submitAssessment} className="rounded-xl border p-4 space-y-4">
        <h2 className="font-semibold text-lg">Record outcome assessment</h2>
        <div>
          <Label>Student</Label>
          <select
            className="select select-bordered w-full"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.admissionNumber})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Outcome</Label>
          <select
            className="select select-bordered w-full"
            value={outcomeId}
            onChange={(e) => setOutcomeId(e.target.value)}
            required
          >
            <option value="">Select outcome</option>
            {outcomes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.code ? `${o.code}: ` : ""}
                {o.description.slice(0, 80)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Competency level</Label>
          <select
            className="select select-bordered w-full"
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            required
          >
            <option value="">Select level</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code} — {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Term</Label>
            <input
              className="input input-bordered w-full"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <div>
            <Label>Year</Label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <Label>Comments</Label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
          />
        </div>
        <Button type="submit" disabled={loading || !outcomes.length}>
          Save assessment
        </Button>
      </form>

      <form onSubmit={submitObservation} className="rounded-xl border p-4 space-y-4">
        <h2 className="font-semibold text-lg">Add observation</h2>
        <div>
          <Label>Student</Label>
          <select
            className="select select-bordered w-full"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.admissionNumber})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Notes</Label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          Save observation
        </Button>
      </form>

      {msg && (
        <p className="text-success text-sm lg:col-span-2">{msg}</p>
      )}
      {err && (
        <p className="text-error text-sm lg:col-span-2">{err}</p>
      )}
    </div>
  );
}
