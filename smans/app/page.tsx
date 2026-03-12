// app/page.tsx  (public homepage / landing page)
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const totalStudents = await prisma.student.count().catch(() => 0);
  const totalClasses = await prisma.class.count().catch(() => 0);

  const recentAnnouncements = await prisma.notification.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    where: { read: false },
    select: { title: true, message: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-base-100">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-focus to-primary text-primary-content">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary-content/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
        </div>

        <div className="container mx-auto px-6 py-28 md:py-36 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-primary-content/85 text-sm font-medium px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Modern School Management System
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
            Welcome to{" "}
            <span className="relative inline-block">
              <span className="text-secondary">SMANS</span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-secondary/40 rounded-full" />
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-primary-content/75 leading-relaxed">
            A modern, secure, and efficient School Management System for students, teachers, parents, and administrators.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-primary-content hover:bg-white/10 px-10 py-6 text-base rounded-xl backdrop-blur-sm"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary-focus text-secondary-content font-bold px-10 py-6 text-base rounded-xl shadow-xl shadow-black/20 hover:scale-105 transition-all"
            >
              <Link href="/auth/signup" className="flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Trust row */}
          <div className="mt-14 flex flex-wrap justify-center gap-6 text-primary-content/50 text-sm">
            {["Secure & Reliable", "Role-Based Access", "Real-Time Updates"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 72L1440 72L1440 18C1200 72 960 0 720 18C480 36 240 0 0 36L0 72Z" className="fill-base-100" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-24 bg-base-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">By the Numbers</p>
            <h2 className="text-4xl md:text-5xl font-black text-base-content">SMANS at a Glance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Users, value: totalStudents.toLocaleString(), label: "Active Students", suffix: "" },
              { icon: GraduationCap, value: totalClasses, label: "Classes & Subjects", suffix: "+" },
              { icon: CalendarCheck, value: "98", label: "Average Attendance", suffix: "%" },
            ].map(({ icon: Icon, value, label, suffix }) => (
              <div
                key={label}
                className="group relative bg-base-100 border border-neutral/40 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-300" />
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-5xl font-black text-base-content mb-1">
                  {value}<span className="text-primary">{suffix}</span>
                </div>
                <p className="text-base-content/55 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-base-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">What We Offer</p>
            <h2 className="text-4xl md:text-5xl font-black text-base-content mb-4">Why Choose SMANS?</h2>
            <p className="text-base-content/55 max-w-lg mx-auto text-lg">
              Everything your institution needs, unified in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: CalendarCheck,
                iconColor: "text-secondary",
                iconBg: "bg-secondary/10",
                title: "Real-Time Attendance",
                desc: "Mark attendance instantly, view daily/monthly reports, and send alerts to parents.",
              },
              {
                icon: BookOpen,
                iconColor: "text-primary",
                iconBg: "bg-primary/10",
                title: "Grades & Exams",
                desc: "Enter marks, publish results, generate transcripts, and track student performance.",
              },
              {
                icon: DollarSign,
                iconColor: "text-secondary",
                iconBg: "bg-secondary/10",
                title: "Fee Management",
                desc: "Track invoices, record payments, send reminders, and monitor overdue fees.",
              },
            ].map(({ icon: Icon, iconColor, iconBg, title, desc }) => (
              <Card
                key={title}
                className="group border border-neutral/30 bg-base-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-base-content">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base-content/60 text-sm leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Announcements ── */}
      <section className="py-24 bg-base-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Notice Board</p>
            <h2 className="text-4xl md:text-5xl font-black text-base-content">Latest School Updates</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {recentAnnouncements.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 text-base-content/30">
                <Bell className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">No recent announcements</p>
              </div>
            ) : (
              recentAnnouncements.map(
                (
                  ann: Prisma.NotificationGetPayload<{
                    select: { title: true; message: true; createdAt: true };
                  }>,
                  i: number
                ) => (
                  <Card
                    key={i}
                    className="group border border-neutral/30 bg-base-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Announcement
                        </span>
                        <p className="text-xs text-base-content/40">
                          {format(new Date(ann.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <CardTitle className="text-lg font-bold text-base-content leading-snug">
                        {ann.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base-content/60 text-sm line-clamp-3 leading-relaxed">{ann.message}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all duration-200">
                        Read more <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </CardContent>
                  </Card>
                )
              )
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 overflow-hidden bg-primary text-primary-content">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary-content/5 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="text-sm font-bold text-secondary uppercase tracking-widest mb-4">Get Started Today</p>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Ready to Join SMANS?
          </h2>
          <p className="text-primary-content/70 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Experience a modern school management system that makes education simpler and more connected.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-primary-content hover:bg-white/10 px-12 py-7 text-base rounded-xl backdrop-blur-sm"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary-focus text-secondary-content font-bold px-12 py-7 text-base rounded-xl shadow-xl shadow-black/20 hover:scale-105 transition-all"
            >
              <Link href="/auth/signup" className="flex items-center gap-2">
                Register Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}