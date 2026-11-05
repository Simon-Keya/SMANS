"use client";

import { Menu, X, School } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

/**
 * Mobile top bar + slide-over drawer that reuses Sidebar content.
 * Desktop sidebar remains in layout (hidden md:flex).
 */
export default function MobileNav({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 flex items-center gap-3 border-b border-neutral bg-base-100 px-4 h-14">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <School className="h-4 w-4 text-primary-content" />
          </div>
          <span className="font-semibold text-primary">SMANS</span>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(100%,18rem)] bg-base-200 shadow-xl overflow-y-auto">
            {/* Force sidebar visible inside drawer */}
            <div className="[&>div]:!flex [&>div]:!static [&>div]:!h-auto [&>div]:!w-full">
              <Sidebar role={role} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
