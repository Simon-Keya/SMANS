// hooks/useAssignments.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

// Export the interface so other files can use it
export interface Assignment {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  class: { name: string };
  subject: { name: string; code: string };
  createdByUser: { name: string } | null;
}

export function useAssignments({
  classId,
  studentId,
}: {
  classId?: string;
  studentId?: string;
} = {}) {
  const query = new URLSearchParams();
  if (classId) query.set("classId", classId);
  if (studentId) query.set("studentId", studentId);

  const url = `/api/assignments?${query.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{ assignments: Assignment[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  return {
    assignments: data?.assignments ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}