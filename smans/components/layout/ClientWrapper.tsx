"use client";

import Footer from "@/components/layout/Footer"; // ← Add this import
import Header from "@/components/layout/Header"; // ← Add this import
import { usePathname } from "next/navigation";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Header />}
      <main className="flex-1">{children}</main>
      <Footer />  {/* Footer always visible */}
    </>
  );
}