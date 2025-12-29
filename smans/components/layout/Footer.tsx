export default function Footer() {
    return (
      <footer className="border-t bg-muted/40 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} School Management System. All rights reserved.
        </div>
      </footer>
    );
  }