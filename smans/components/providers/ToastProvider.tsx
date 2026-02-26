// components/providers/ToastProvider.tsx
"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

/**
 * Toast provider using react-hot-toast
 * Renders toasts at the top-right by default
 * Customize position, duration, style as needed
 */
export default function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
          success: {
            style: {
              background: "#10b981",
              color: "white",
            },
          },
          error: {
            style: {
              background: "#ef4444",
              color: "white",
            },
          },
          loading: {
            style: {
              background: "#3b82f6",
              color: "white",
            },
          },
        }}
      />
    </>
  );
}