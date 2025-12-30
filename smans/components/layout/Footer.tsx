import { Facebook, Instagram, Mail, MapPin, Phone, School, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* School Info & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
                <School className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">SMANS</h3>
                <p className="text-xs text-muted-foreground">School Management System</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering education through innovative technology. Providing seamless management for administrators, teachers, students, and parents.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/features" className="hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/support" className="hover:text-foreground transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>P.O. Box 123-00100, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>info@smans.ac.ke</span>
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter (Optional) */}
          <div>
            <h4 className="font-semibold mb-4">Stay Connected</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Follow us for updates, news, and educational resources.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} SMANS - School Management System. All rights reserved. 
            {" "}Developed with ❤️ for education.
          </p>
        </div>
      </div>
    </footer>
  );
}