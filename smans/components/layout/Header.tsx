// components/Header.tsx
"use client";

import { Bell, ChevronDown, GraduationCap, LogOut, Menu, Settings, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
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
  const notifications = 3;

  // Role badge color
  const roleBadgeClass =
    user?.role === "ADMIN"
      ? "bg-error/10 text-error"
      : user?.role === "TEACHER"
      ? "bg-primary/10 text-primary"
      : user?.role === "PARENT"
      ? "bg-warning/10 text-warning"
      : "bg-success/10 text-success";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/95 backdrop-blur-xl supports-[backdrop-filter]:bg-base-100/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

        {/* ── Logo ── */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30 group-hover:bg-primary-focus transition-colors duration-200">
            <GraduationCap className="w-5 h-5 text-primary-content" />
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-base font-black tracking-tight text-base-content">SMANS</p>
            <p className="text-xs text-base-content opacity-50">School Management System</p>
          </div>
        </Link>

        {/* ── Desktop Actions ── */}
        <div className="hidden md:flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-base-200 animate-pulse" />
          ) : isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-xl hover:bg-base-200 transition-colors"
                  >
                    <Bell className="h-4 w-4 text-base-content" />
                    {notifications > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-base-100 border-base-300 shadow-xl rounded-2xl p-1">
                  <DropdownMenuLabel className="text-sm font-bold text-base-content px-3 py-2">
                    Notifications
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-base-300" />

                  {[
                    { title: "New admission request", sub: "Alice Kamau – Class 8" },
                    { title: "Fee payment received", sub: "KSh 15,000 received" },
                  ].map(({ title, sub }) => (
                    <DropdownMenuItem
                      key={title}
                      className="flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl hover:bg-base-200 cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-base-content">{title}</span>
                      <span className="text-xs text-base-content opacity-60">{sub}</span>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator className="bg-base-300" />
                  <DropdownMenuItem className="justify-center text-xs font-semibold text-primary hover:bg-base-200 rounded-xl py-2 cursor-pointer">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2.5 hover:bg-base-200 px-2.5 py-1.5 rounded-xl h-auto transition-colors"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-primary text-primary-content text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold leading-none text-base-content mb-0.5">
                        {user?.name || "User"}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${roleBadgeClass}`}>
                        {user?.role?.toLowerCase() || "guest"}
                      </span>
                    </div>
                    <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-base-content opacity-40" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-base-100 border-base-300 shadow-xl rounded-2xl p-1">
                  {/* Account info */}
                  <div className="px-3 py-3 flex items-center gap-3">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-primary text-primary-content text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-base-content leading-none mb-1">
                        {user?.name || "User"}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${roleBadgeClass}`}>
                        {user?.role?.toLowerCase() || "guest"}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-base-300" />

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-base-200 px-3 py-2 cursor-pointer">
                    <Link href="/dashboard/profile" className="flex items-center gap-2.5 text-base-content">
                      <div className="w-7 h-7 bg-base-200 rounded-lg flex items-center justify-center">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-base-200 px-3 py-2 cursor-pointer">
                    <Link href="/dashboard/settings" className="flex items-center gap-2.5 text-base-content">
                      <div className="w-7 h-7 bg-base-200 rounded-lg flex items-center justify-center">
                        <Settings className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-medium">Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-base-300" />

                  <DropdownMenuItem
                    className="rounded-xl px-3 py-2 cursor-pointer hover:bg-error/10 focus:bg-error/10"
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  >
                    <div className="w-7 h-7 bg-error/10 rounded-lg flex items-center justify-center mr-2.5">
                      <LogOut className="h-3.5 w-3.5 text-error" />
                    </div>
                    <span className="text-sm font-medium text-error">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-base-content font-medium hover:bg-base-200 rounded-xl"
                asChild
              >
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary-focus text-primary-content font-bold rounded-xl shadow-md shadow-primary/20 hover:scale-105 transition-all px-5"
                asChild
              >
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* ── Mobile Toggle ── */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 rounded-xl text-base-content hover:bg-base-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-base-300 bg-base-100">
          <div className="container px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                {/* User card */}
                <div className="flex items-center gap-3 px-3 py-3 bg-base-200 rounded-2xl">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary text-primary-content font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-base-content text-sm">{user?.name || "User"}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${roleBadgeClass}`}>
                      {user?.role?.toLowerCase() || "guest"}
                    </span>
                  </div>
                </div>

                <nav className="space-y-1">
                  <MobileLink href="/dashboard/profile" icon={<User className="h-4 w-4" />} label="Profile" />
                  <MobileLink href="/dashboard/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-error hover:bg-error/10 transition-colors text-sm font-medium"
                  >
                    <div className="w-7 h-7 bg-error/10 rounded-lg flex items-center justify-center">
                      <LogOut className="h-3.5 w-3.5 text-error" />
                    </div>
                    Sign Out
                  </button>
                </nav>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-1">
                <Button variant="outline" asChild className="border-base-300 text-base-content rounded-xl font-medium">
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button className="bg-primary hover:bg-primary-focus text-primary-content font-bold rounded-xl" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-base-content hover:bg-base-200 transition-colors text-sm font-medium"
    >
      <div className="w-7 h-7 bg-base-200 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      {label}
    </Link>
  );
}