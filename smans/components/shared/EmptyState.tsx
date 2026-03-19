// components/shared/EmptyState.tsx
import { FileSearch, FolderOpen } from "lucide-react";
import Link from "next/link";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: EmptyStateAction[];
  compact?: boolean;
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary: "bg-primary hover:bg-primary-focus text-primary-content",
  secondary: "bg-secondary hover:bg-secondary-focus text-secondary-content",
  outline: "border border-neutral/40 text-base-content hover:bg-base-200",
};

export default function EmptyState({
  title = "Nothing here yet",
  description = "Get started by creating your first record.",
  icon,
  actions,
  compact = false,
  className = "",
}: EmptyStateProps) {
  const defaultIcon = (
    <div className="relative">
      <FolderOpen className="h-12 w-12 text-base-content/20" />
      <FileSearch className="h-5 w-5 text-base-content/30 absolute -bottom-1 -right-1" />
    </div>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-8 px-4" : "py-16 px-6"
      } ${className}`}
    >
      {/* Icon */}
      <div
        className={`${
          compact ? "mb-3" : "mb-5"
        } flex items-center justify-center p-4 bg-base-200 rounded-2xl`}
      >
        {icon ?? defaultIcon}
      </div>

      {/* Text */}
      <h3
        className={`font-semibold text-base-content ${
          compact ? "text-base mb-1" : "text-xl mb-2"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-base-content/60 max-w-sm leading-relaxed ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {description}
      </p>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className={`flex flex-wrap items-center justify-center gap-3 ${compact ? "mt-4" : "mt-6"}`}>
          {actions.map((action, i) => {
            const cls = `${
              variantClasses[action.variant ?? "primary"]
            } inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all`;

            if (action.href) {
              return (
                <Link key={i} href={action.href} className={cls}>
                  {action.icon}
                  {action.label}
                </Link>
              );
            }

            return (
              <button key={i} onClick={action.onClick} className={cls}>
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}