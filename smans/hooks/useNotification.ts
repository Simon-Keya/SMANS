// hooks/useNotifications.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 30000, // refresh every 30s
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    refresh: mutate,
  };
}