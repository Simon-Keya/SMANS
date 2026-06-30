import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import AuthSessionProvider from "@/components/providers/AuthSessionProviders";
import { ToastProvider, ToastViewport } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
  title: "SMANS - School Management System",
  description: "A modern school management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="smans"           // ← This is important
      className="h-full"
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-base-100 antialiased">
        <AuthSessionProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastViewport />
          </ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}