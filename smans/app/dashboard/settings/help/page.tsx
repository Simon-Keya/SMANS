// app/dashboard/settings/help/page.tsx
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { 
  BookOpen, 
  FileText, 
  Video, 
  HelpCircle, 
  Search, 
  Mail, 
  MessageCircle,
  ChevronRight,
  ExternalLink,
  Download,
  Users,
  Settings2,
  Shield,
  GraduationCap
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HelpPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const helpCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of SMANS and how to navigate the system",
      articles: 12,
      href: "/dashboard/settings/help/getting-started",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      title: "User Management",
      description: "How to manage students, teachers, parents and staff",
      articles: 8,
      href: "/dashboard/settings/help/users",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: GraduationCap,
      title: "Academic Management",
      description: "Manage classes, subjects, exams, and grades",
      articles: 15,
      href: "/dashboard/settings/help/academic",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Settings2,
      title: "System Settings",
      description: "Configure school settings, permissions, and preferences",
      articles: 6,
      href: "/dashboard/settings/help/settings",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Best practices for securing your school data",
      articles: 5,
      href: "/dashboard/settings/help/security",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: FileText,
      title: "Reports & Analytics",
      description: "Generate and interpret school reports",
      articles: 9,
      href: "/dashboard/settings/help/reports",
      color: "text-teal-500",
      bgColor: "bg-teal-50",
    },
  ];

  const quickLinks = [
    { icon: Video, title: "Video Tutorials", href: "/dashboard/settings/help/videos" },
    { icon: FileText, title: "User Guide (PDF)", href: "/dashboard/settings/help/guide" },
    { icon: MessageCircle, title: "FAQ", href: "/dashboard/settings/help/faq" },
    { icon: Mail, title: "Contact Support", href: "/dashboard/settings/contact" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <Link href="/dashboard/settings" className="hover:text-primary">Settings</Link>
            <ChevronRight className="h-4 w-4" />
            <span>Help Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mt-2">Help Center</h1>
          <p className="text-base-content/60 mt-1">
            Find answers, guides, and support resources
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/settings/contact">
              <Mail className="h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
              <input
                type="text"
                placeholder="Search for help articles, guides, and FAQs..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-base-300 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button className="gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-base-content/60">Popular:</span>
            <Link href="/dashboard/settings/help?q=students" className="text-xs text-primary hover:underline">Students</Link>
            <Link href="/dashboard/settings/help?q=grades" className="text-xs text-primary hover:underline">Grades</Link>
            <Link href="/dashboard/settings/help?q=attendance" className="text-xs text-primary hover:underline">Attendance</Link>
            <Link href="/dashboard/settings/help?q=fees" className="text-xs text-primary hover:underline">Fees</Link>
            <Link href="/dashboard/settings/help?q=reports" className="text-xs text-primary hover:underline">Reports</Link>
          </div>
        </CardContent>
      </Card>

      {/* Help Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Browse Help Topics</h2>
          <Link href="/dashboard/settings/help/all" className="text-sm text-primary hover:underline">
            View all topics →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {helpCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.href} href={category.href} className="group">
                <Card className="h-full hover:shadow-md transition-all border border-base-200 hover:border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${category.bgColor} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold text-base-content">
                          {category.title}
                        </CardTitle>
                        <p className="text-xs text-base-content/60 mt-1">
                          {category.articles} articles
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-base-content/60 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-primary/60 group-hover:text-primary transition-colors">
                      <span>Browse guides</span>
                      <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Resources */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-all hover:border-primary/20 text-center p-4">
                <div className="flex flex-col items-center gap-2">
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">{link.title}</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Need More Help? */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6 text-center">
          <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
          <p className="text-base-content/60 max-w-md mx-auto mb-4">
            Our support team is ready to assist you with any questions or issues.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard/settings/contact">
                <Mail className="h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard/settings/contact">
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}