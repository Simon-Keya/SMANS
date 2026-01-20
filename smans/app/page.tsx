import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
    <main className="min-h-screen bg-base-100 text-base-content">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
        <div className="container mx-auto px-6 py-32 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary mb-6">
            Smart School Management,
            <span className="block text-secondary">
              Built for Modern Education
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-base-content/80 mb-12 leading-relaxed">
            SMANS helps schools manage students, staff, academics, and
            communication in one secure, easy-to-use platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="btn-primary" asChild>
              <Link href="/auth/login">Access System</Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="btn-outline"
              asChild
            >
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </div>

        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-slate-100/5 opacity-20 pointer-events-none" />
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-28 bg-base-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Designed for Schools & Colleges
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-base-content/70">
              Purpose-built tools that simplify administration while enhancing
              learning outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Users className="h-8 w-8 text-primary" />}
              title="Student Administration"
              description="Centralized student records, admissions, enrollment history, and academic profiles."
            />
            <FeatureCard
              icon={<CalendarCheck className="h-8 w-8 text-primary" />}
              title="Attendance & Discipline"
              description="Daily attendance, automated summaries, and early-warning tracking."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-primary" />}
              title="Academic Performance"
              description="Grades, transcripts, analytics, and performance monitoring in real time."
            />
            <FeatureCard
              icon={<Globe2 className="h-8 w-8 text-primary" />}
              title="Timetable & Scheduling"
              description="Conflict-free scheduling for classes, teachers, and examinations."
            />
            <FeatureCard
              icon={<Smartphone className="h-8 w-8 text-primary" />}
              title="Anywhere Access"
              description="Optimized for desktops, tablets, and mobile devices."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-primary" />}
              title="Secure & Reliable"
              description="Role-based access, encrypted data, and automated backups."
            />
          </div>
        </div>
      </section>

      {/* ================ CTA ================*/}
      <section className="py-28 bg-gradient-to-r from-primary to-secondary text-primary-content">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Empower Your Institution
          </h2>

          <p className="max-w-2xl mx-auto text-lg opacity-90 mb-10">
            From administration to academics, SMANS gives your school the tools
            it needs to operate efficiently and professionally.
          </p>

          <Button
            size="lg"
            className="btn btn-accent text-white shadow-xl"
            asChild
          >
            <Link href="/auth/login">Get Started</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

/* ================ FEATURE CARD ================= */

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
    <Card className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/10 hover:border-primary/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold text-primary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center text-base-content/80 leading-relaxed">
        {description}
      </CardContent>
    </Card>
  );
}