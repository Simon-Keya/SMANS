// app/page.tsx  (Public Homepage for your school)
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
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

type Announcement = {
  title: string;
  message: string;
  createdAt: Date;
};

export default async function HomePage() {
  const totalStudents = await prisma.student.count().catch(() => 0);
  const totalClasses = await prisma.class.count().catch(() => 0);

  // Simple & safe type for announcements
  const recentAnnouncements: Announcement[] = await prisma.notification
    .findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: { read: false },
      select: {
        title: true,
        message: true,
        createdAt: true,
      },
    })
    .catch(() => []);

  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←← CUSTOMIZE THESE
  const schoolName = "Your School Name";           // ← Change to your actual school name
  const schoolTagline = "Nurturing Excellence through Competency-Based Education";
  const studentCount = totalStudents > 0 ? totalStudents.toLocaleString() : "850";
  const teacherCount = "42";                       // Update with real number
  const performanceRate = "97";                    // e.g. KCSE / CBC performance
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

  return (
    <div className="min-h-screen bg-base-100">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-focus to-primary text-primary-content">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 py-28 md:py-36 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Powered by SMANS
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none text-white">
            Welcome to <span className="text-white drop-shadow-lg">{schoolName}</span>
          </h1>

          <p className="text-lg md:text-xl mb-4 max-w-2xl mx-auto text-white/90">
            {schoolTagline}
          </p>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-white/75 leading-relaxed">
            Empowering learners with modern tools, real-time updates, and seamless collaboration between students, teachers, and parents.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 px-10 py-6 text-base rounded-xl backdrop-blur-sm"
            >
              <Link href="/auth/login">Access Portal</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 text-primary font-bold px-10 py-6 text-base rounded-xl shadow-xl shadow-black/20 hover:scale-105 transition-all"
            >
              <Link href="/auth/login" className="flex items-center gap-2">
                Login as Parent / Student <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-6 text-white/60 text-sm">
            {["Competency-Based Curriculum (CBC)", "Real-Time Attendance", "Secure Fee Management", "Parent Engagement"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/80" /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 72L1440 72L1440 18C1200 72 960 0 720 18C480 36 240 0 0 36L0 72Z" className="fill-base-100" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-base-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Our School at a Glance</p>
            <h2 className="text-4xl md:text-5xl font-black text-base-content">Proudly Serving Our Community</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Users, value: studentCount, label: "Enrolled Students", suffix: "" },
              { icon: GraduationCap, value: teacherCount, label: "Dedicated Teachers", suffix: "" },
              { icon: CalendarCheck, value: performanceRate, label: "Average Performance", suffix: "%" },
            ].map(({ icon: Icon, value, label, suffix }) => (
              <div
                key={label}
                className="group relative bg-base-100 border border-base-300 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-300" />
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-5xl font-black text-base-content mb-1">
                  {value}<span className="text-primary">{suffix}</span>
                </div>
                <p className="text-base-content font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-base-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Powered by SMANS</p>
            <h2 className="text-4xl md:text-5xl font-black text-base-content mb-4">Making School Life Simpler</h2>
            <p className="text-base-content max-w-lg mx-auto text-lg">
              Real-time tools designed to support teaching, learning, and strong parent involvement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: CalendarCheck,
                title: "Real-Time Attendance",
                desc: "Instant marking, daily reports, and automatic alerts to parents.",
              },
              {
                icon: BookOpen,
                title: "CBC Assessments & Grading",
                desc: "Seamless recording of competencies, progress tracking, and report generation.",
              },
              {
                icon: DollarSign,
                title: "Fee & Finance Management",
                desc: "Track payments, send reminders, and maintain transparent school finances.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card
                key={title}
                className="group border border-base-300 bg-base-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold text-base-content">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base-content text-sm leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-24 bg-base-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">School Notice Board</p>
            <h2 className="text-4xl md:text-5xl font-black text-base-content">Latest Updates</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {recentAnnouncements.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 text-base-content opacity-40">
                <Bell className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">No recent announcements at the moment</p>
              </div>
            ) : (
              recentAnnouncements.map((ann, i) => (
                <Card
                  key={i}
                  className="group border border-base-300 bg-base-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Notice
                      </span>
                      <p className="text-xs text-base-content opacity-50">
                        {format(new Date(ann.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <CardTitle className="text-lg font-bold text-base-content leading-snug">
                      {ann.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base-content text-sm line-clamp-3 leading-relaxed">{ann.message}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all duration-200">
                      Read more <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-28 overflow-hidden bg-primary text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-4">Stay Connected</p>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white">
            Join the {schoolName} Community
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Access attendance, grades, fee balance, and school notices anytime, anywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 px-12 py-7 text-base rounded-xl backdrop-blur-sm"
            >
              <Link href="/auth/login">Open Portal</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 text-primary font-bold px-12 py-7 text-base rounded-xl shadow-xl shadow-black/20 hover:scale-105 transition-all"
            >
              <Link href="/auth/login" className="flex items-center gap-2">
                Login Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
