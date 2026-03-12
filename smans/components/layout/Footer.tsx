// components/Footer.tsx
import {
  ArrowUpRight,
  Facebook,
  GraduationCap,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-base-100 border-t border-base-300">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">

          {/* ── Brand ── */}
          <div className="space-y-5 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                <GraduationCap className="w-6 h-6 text-primary-content" />
              </div>
              <div>
                <h3 className="text-base font-black text-base-content leading-tight">SMANS</h3>
                <p className="text-xs text-base-content">School Management System</p>
              </div>
            </div>

            <p className="text-sm text-base-content leading-relaxed">
              A secure and modern platform designed to simplify academic and administrative operations for educational institutions.
            </p>

            {/* Social icons */}
            <div className="flex gap-3 pt-1">
              {[Facebook, Twitter, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-base-200 border border-base-300 flex items-center justify-center text-base-content hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="text-sm font-bold text-base-content uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["About", "Features", "Privacy", "Terms", "Support"].map((link) => (
                <li key={link}>
                  <a
                    href={`/${link.toLowerCase()}`}
                    className="text-sm text-base-content hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-base-content group-hover:bg-primary transition-colors" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="text-sm font-bold text-base-content uppercase tracking-widest mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              {[
                { icon: MapPin, text: "Nairobi, Kenya" },
                { icon: Phone, text: "+254 700 000 000" },
                { icon: Mail, text: "info@smans.ac.ke" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-base-content">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── About ── */}
          <div>
            <h4 className="text-sm font-bold text-base-content uppercase tracking-widest mb-5">
              About
            </h4>
            <p className="text-sm text-base-content leading-relaxed mb-4">
              SMANS serves students, teachers, parents, and administrators with role-based tools for attendance, grading, fees, and communication.
            </p>
            <a
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Get started free <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-14 pt-6 border-t border-base-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-base-content">
            © {year} <span className="text-primary font-semibold">SMANS</span>. Built for education.
          </p>

          <p className="text-xs text-base-content flex items-center gap-1">
            Powered by{" "}
            <a
              href="https://babbage-technologies.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              Babbage Technologies <ArrowUpRight className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}