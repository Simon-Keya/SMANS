// hooks/useClasses.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useClasses(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const { data, error, isLoading, mutate } = useSWR(`/api/classes${query}`, fetcher);

  return {
    classes: data?.classes ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}