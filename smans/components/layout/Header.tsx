"use client";

import { Bell, LogOut, Menu, School, Settings, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropDownMenu";

export default function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const user = session?.user;
  const notifications = 3; // ← Replace with real count later (e.g., from DB or API)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-base-100/95 backdrop-blur-xl supports-[backdrop-filter]:bg-base-100/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo – links to dashboard if logged in, otherwise home */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm group-hover:bg-primary/90 transition-colors">
            <School className="h-6 w-6 text-primary-content" />
          </div>
          <div className="hidden sm:block leading-tight">
            <h1 className="text-lg font-semibold tracking-tight text-primary">
              SMANS
            </h1>
            <p className="text-xs text-muted-foreground">
              School Management System
            </p>
          </div>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            // Loading state
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <>
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hover:bg-muted">
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center bg-error">
                        {notifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1">
                    <span className="font-medium">New admission request</span>
                    <span className="text-xs text-muted-foreground">Alice Kamau – Class 8</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1">
                    <span className="font-medium">Fee payment received</span>
                    <span className="text-xs text-muted-foreground">KSh 15,000 received</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 hover:bg-muted px-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                      <AvatarFallback className="bg-primary text-primary-content">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role || "Guest"}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // Not logged in → show Login & Sign Up buttons
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button size="sm" className="btn-primary" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-base-100/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-4">
            {isAuthenticated ? (
              <>
                {/* User Info in Mobile */}
                <div className="flex items-center gap-3 px-2 py-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name || "User"}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user?.role || "Guest"}</p>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="space-y-1">
                  <MobileLink href="/dashboard/profile" icon={<User />} label="Profile" />
                  <MobileLink href="/dashboard/settings" icon={<Settings />} label="Settings" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-destructive hover:bg-muted"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </nav>
              </>
            ) : (
              <>
                {/* Mobile Auth Buttons */}
                <div className="flex flex-col gap-3 px-2">
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Log In</Link>
                  </Button>
                  <Button className="btn-primary" asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// Reusable mobile link component
function MobileLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-base-content/80 hover:bg-muted"
    >
      {icon}
      {label}
    </Link>
  );
}