import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BarChart, CalendarCheck, Globe, Smartphone, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Hero Section */}
      <header className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/school-background.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Welcome to SMANS</h1>
          <p className="text-2xl mb-8 text-muted-foreground">Streamline Your School Management</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="flex flex-col items-center">
                <Users className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Student Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                Easily manage student profiles, enrollment, and transfers with our intuitive interface.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-col items-center">
                <CalendarCheck className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Attendance Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                Mark attendance, generate reports, and send notifications to parents in real-time.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-col items-center">
                <BarChart className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Grade Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                Enter grades, generate report cards, and analyze student performance with ease.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-col items-center">
                <Globe className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Timetable Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                Create and manage class timetables, assign teachers, and avoid conflicts.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-col items-center">
                <Smartphone className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Mobile Access</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                Responsive design ensures seamless access on desktops, tablets, and mobiles.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your School?</h2>
          <p className="text-xl mb-8">Join thousands of educational institutions using SMANS today.</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/login">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-muted text-muted-foreground text-center text-sm">
        <p>&copy; {new Date().getFullYear()} SMANS. All rights reserved.</p>
      </footer>
    </div>
  );
}