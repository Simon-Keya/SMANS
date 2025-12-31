import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  BarChart3,
  CalendarCheck,
  Globe2,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        <div className="container mx-auto px-6 py-32 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Smart School Management,
            <span className="block text-emerald-400">
              Built for Modern Education
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 mb-12 leading-relaxed">
            SMANS helps schools manage students, staff, academics, and
            communication in one secure, easy-to-use platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white" asChild>
              <Link href="/auth/login">Access System</Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-slate-400 text-slate-100 hover:bg-slate-800"
              asChild
            >
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </div>

        {/* Subtle academic grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-28 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Designed for Schools & Colleges
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
              Purpose-built tools that simplify administration while enhancing
              learning outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Users />}
              title="Student Administration"
              description="Centralized student records, admissions, enrollment history, and academic profiles."
            />
            <FeatureCard
              icon={<CalendarCheck />}
              title="Attendance & Discipline"
              description="Daily attendance, automated summaries, and early-warning tracking."
            />
            <FeatureCard
              icon={<BarChart3 />}
              title="Academic Performance"
              description="Grades, transcripts, analytics, and performance monitoring in real time."
            />
            <FeatureCard
              icon={<Globe2 />}
              title="Timetable & Scheduling"
              description="Conflict-free scheduling for classes, teachers, and examinations."
            />
            <FeatureCard
              icon={<Smartphone />}
              title="Anywhere Access"
              description="Optimized for desktops, tablets, and mobile devices."
            />
            <FeatureCard
              icon={<ShieldCheck />}
              title="Secure & Reliable"
              description="Role-based access, encrypted data, and automated backups."
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-28 bg-slate-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Empower Your Institution
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-300 mb-10">
            From administration to academics, SMANS gives your school the tools
            it needs to operate efficiently and professionally.
          </p>

          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            asChild
          >
            <Link href="/auth/login">Get Started</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

/* ================= FEATURE CARD ================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border border-slate-200 bg-white hover:shadow-xl transition-all duration-300">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center text-slate-600 leading-relaxed">
        {description}
      </CardContent>
    </Card>
  );
}
