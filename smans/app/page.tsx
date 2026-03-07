// app/page.tsx  (public homepage / landing page)
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client"; // ← Needed for precise payload typing
import { format } from "date-fns";
import { BookOpen, CalendarCheck, DollarSign, GraduationCap, Users } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  // Public stats (no auth needed)
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-focus text-primary-content">
        <div className="container mx-auto px-6 py-24 md:py-32 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Welcome to <span className="text-secondary">SMANS</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            A modern, secure, and efficient School Management System for students, teachers, parents, and administrators.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-content text-primary-content hover:bg-primary-content/10 px-8 py-6 text-lg"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary-focus text-secondary-content px-8 py-6 text-lg"
            >
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        </div>
      </section>

      {/* Quick Stats Teaser */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-base-content">
            SMANS at a Glance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border border-neutral bg-base-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="text-center pb-2">
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-5xl font-bold text-primary">
                  {totalStudents.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl font-medium text-base-content">Active Students</p>
              </CardContent>
            </Card>

            <Card className="border border-neutral bg-base-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="text-center pb-2">
                <GraduationCap className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-5xl font-bold text-primary">
                  {totalClasses}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl font-medium text-base-content">Classes & Subjects</p>
              </CardContent>
            </Card>

            <Card className="border border-neutral bg-base-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="text-center pb-2">
                <CalendarCheck className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-5xl font-bold text-primary">98%</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl font-medium text-base-content">Average Attendance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features / Highlights */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-base-content">
            Why Choose SMANS?
          </h2>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <Card className="border border-neutral bg-base-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <CalendarCheck className="w-12 h-12 text-secondary mb-4" />
                <CardTitle className="text-2xl">Real-Time Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base-content">
                  Mark attendance instantly, view daily/monthly reports, and send alerts to parents.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-neutral bg-base-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-secondary mb-4" />
                <CardTitle className="text-2xl">Grades & Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base-content">
                  Enter marks, publish results, generate transcripts, and track student performance.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-neutral bg-base-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <DollarSign className="w-12 h-12 text-secondary mb-4" />
                <CardTitle className="text-2xl">Fee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base-content">
                  Track invoices, record payments, send reminders, and monitor overdue fees.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Announcements */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-base-content">
            Latest School Updates
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {recentAnnouncements.length === 0 ? (
              <p className="text-center col-span-3 text-muted">No recent announcements</p>
            ) : (
              recentAnnouncements.map(
                (
                  ann: Prisma.NotificationGetPayload<{
                    select: { title: true; message: true; createdAt: true };
                  }>,
                  i: number
                ) => (
                  <Card key={i} className="border border-neutral bg-base-100 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader>
                      <CardTitle className="text-xl">{ann.title}</CardTitle>
                      <p className="text-sm text-muted mt-1">
                        {format(new Date(ann.createdAt), "MMM d, yyyy")}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base-content line-clamp-3">{ann.message}</p>
                    </CardContent>
                  </Card>
                )
              )
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-primary-content py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Join SMANS?
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90">
            Experience a modern school management system that makes education simpler and more connected.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-content text-primary-content hover:bg-primary-content/10 px-10 py-7 text-lg"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary-focus text-secondary-content px-10 py-7 text-lg"
            >
              <Link href="/auth/register">Register Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}