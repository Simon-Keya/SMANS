import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  School,
  Twitter,
  Youtube,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-base-100">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-sm">
                <School className="h-7 w-7 text-primary-content" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary">
                  SMANS
                </h3>
                <p className="text-xs text-muted-foreground">
                  School Management System
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              A secure and modern platform designed to simplify academic and
              administrative operations for educational institutions.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-base-content">
              Quick Links
            </h4>

            <ul className="space-y-2 text-sm text-muted-foreground">
              {["About", "Features", "Privacy", "Terms", "Support"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`/${link.toLowerCase()}`}
                      className="hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-base-content">
              Contact
            </h4>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3 items-center">
                <MapPin className="h-4 w-4 text-primary" />
                Nairobi, Kenya
              </li>

              <li className="flex gap-3 items-center">
                <Phone className="h-4 w-4 text-primary" />
                +254 700 000 000
              </li>

              <li className="flex gap-3 items-center">
                <Mail className="h-4 w-4 text-primary" />
                info@smans.ac.ke
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-base-content">
              Connect
            </h4>

            <div className="flex gap-4">
              {[Facebook, Twitter, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          © {year} <span className="text-primary font-medium">SMANS</span>. Built for education.
        </div>
      </div>
    </footer>
  );
}