"use client";

import { Bell, LogOut, Menu, School, Settings, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
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
  const notifications = 3; // Replace with real count later

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral bg-base-100/95 backdrop-blur-xl supports-[backdrop-filter]:bg-base-100/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm group-hover:bg-primary-focus transition-colors">
            <School className="h-6 w-6 text-primary-content" />
          </div>
          <div className="hidden sm:block leading-tight">
            <h1 className="text-lg font-semibold tracking-tight text-primary">
              SMANS
            </h1>
            <p className="text-xs text-muted">School Management System</p>
          </div>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hover:bg-base-200">
                    <Bell className="h-5 w-5 text-base-content" />
                    {notifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-accent text-accent-content">
                        {notifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-base-100 border-neutral">
                  <DropdownMenuLabel className="text-base-content">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral" />
                  <DropdownMenuItem className="hover:bg-base-200">
                    <div className="flex flex-col">
                      <span className="font-medium text-base-content">New admission request</span>
                      <span className="text-xs text-muted">Alice Kamau – Class 8</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-base-200">
                    <div className="flex flex-col">
                      <span className="font-medium text-base-content">Fee payment received</span>
                      <span className="text-xs text-muted">KSh 15,000 received</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 hover:bg-base-200 px-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-content">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium leading-none text-base-content">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-muted capitalize">
                        {user?.role?.toLowerCase() || "Guest"}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-base-100 border-neutral">
                  <DropdownMenuLabel className="text-base-content">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral" />
                  <DropdownMenuItem asChild className="hover:bg-base-200">
                    <Link href="/dashboard/profile" className="flex items-center gap-2 text-base-content">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-base-200">
                    <Link href="/dashboard/settings" className="flex items-center gap-2 text-base-content">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral" />
                  <DropdownMenuItem
                    className="text-error hover:bg-error/10 focus:text-error"
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary-focus text-primary-content" asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-base-content"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral bg-base-100/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-2 py-3 bg-base-200 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-content">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-base-content">{user?.name || "User"}</p>
                    <p className="text-sm text-muted capitalize">{user?.role?.toLowerCase() || "Guest"}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  <MobileLink href="/dashboard/profile" icon={<User />} label="Profile" />
                  <MobileLink href="/dashboard/settings" icon={<Settings />} label="Settings" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-error hover:bg-error/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </nav>
              </>
            ) : (
              <div className="flex flex-col gap-3 px-2">
                <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/10">
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button className="bg-primary hover:bg-primary-focus text-primary-content" asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-base-content hover:bg-base-200 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}