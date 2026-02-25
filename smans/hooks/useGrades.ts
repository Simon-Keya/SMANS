// hooks/useGrades.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGrades(studentId?: string, examId?: string) {
  const query = new URLSearchParams();
  if (studentId) query.set("studentId", studentId);
  if (examId) query.set("examId", examId);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/grades?${query.toString()}`,
    fetcher
  );

  return {
    grades: data?.grades ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}