// hooks/useParents.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useParents(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const { data, error, isLoading, mutate } = useSWR(`/api/parents${query}`, fetcher);

  return {
    parents: data?.parents ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}