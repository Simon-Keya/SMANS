"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropDownMenu";
import { Bell, LogOut, Menu, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface NavbarProps {
  onMenuClick?: () => void;
  role?: string;          // ← Add role prop
  userName?: string;      // Optional: for display
  userEmail?: string;     // Optional: for tooltip
}

export default function Navbar({
  onMenuClick,
  role = "student",
  userName = "User",
  userEmail = "",
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
      <div className="flex h-16 items-center px-4">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="flex-1" />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-error animate-pulse" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="bg-primary text-primary-content">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-base-content/60 capitalize">{role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-error focus:text-error"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}