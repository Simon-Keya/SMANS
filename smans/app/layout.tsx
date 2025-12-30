import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Toaster } from "@/components/ui/Toast"; // If you have Toast component
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SMANS - School Management System",
  description: "A modern, efficient school management system for administrators, teachers, students, and parents.",
  keywords: "school management, education, attendance, grades, timetable, SMANS",
  authors: [{ name: "Simon Keya" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          "min-h-screen flex flex-col bg-background font-sans antialiased",
          inter.className
        )}
      >
        {/* Header - Only show on non-auth pages or conditionally */}
        <Header />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Toast Notifications */}
        <Toaster />
      </body>
    </html>
  );
}