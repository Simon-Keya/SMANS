// components/shared/LoadingSpinner.tsx
import { GraduationCap } from "lucide-react";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Variant = "spinner" | "dots" | "pulse" | "branded";

interface LoadingSpinnerProps {
  size?: Size;
  variant?: Variant;
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap: Record<Size, { spinner: string; text: string; icon: string }> = {
  xs: { spinner: "loading-xs", text: "text-xs", icon: "h-4 w-4" },
  sm: { spinner: "loading-sm", text: "text-xs", icon: "h-5 w-5" },
  md: { spinner: "loading-md", text: "text-sm", icon: "h-6 w-6" },
  lg: { spinner: "loading-lg", text: "text-base", icon: "h-8 w-8" },
  xl: { spinner: "loading-lg", text: "text-lg", icon: "h-10 w-10" },
};

// Standalone export used by other components (default spinner)
export default function LoadingSpinner({
  size = "md",
  variant = "spinner",
  label,
  fullScreen = false,
  className = "",
}: LoadingSpinnerProps) {
  const { spinner, text, icon } = sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {variant === "spinner" && (
        <span className={`loading loading-spinner text-primary ${spinner}`} />
      )}

      {variant === "dots" && (
        <span className={`loading loading-dots text-primary ${spinner}`} />
      )}

      {variant === "pulse" && (
        <span className={`loading loading-ring text-primary ${spinner}`} />
      )}

      {variant === "branded" && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Pulsing ring */}
            <span
              className={`loading loading-ring text-primary ${
                size === "xl" ? "loading-lg" : spinner
              }`}
              style={{ width: "3.5rem", height: "3.5rem" }}
            />
            {/* Logo in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <GraduationCap className="h-4 w-4 text-primary-content" />
              </div>
            </div>
          </div>

          <span className="text-sm font-semibold text-base-content tracking-wide">
            SMANS
          </span>
        </div>
      )}

      {label && variant !== "branded" && (
        <p className={`text-base-content/60 font-medium ${text}`}>{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

// ── Named exports for convenience ────────────────────────────────────────────

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" variant="branded" label={label} />
    </div>
  );
}

export function InlineLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <span className="loading loading-spinner loading-sm text-primary" />
      {label && <span className="text-sm text-base-content/60">{label}</span>}
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-base-300 rounded-lg w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-base-200 rounded-2xl p-6 animate-pulse space-y-4">
      <div className="h-5 bg-base-300 rounded-lg w-1/3" />
      <div className="h-8 bg-base-300 rounded-lg w-1/2" />
      <div className="h-4 bg-base-300 rounded-lg w-2/3" />
    </div>
  );
}