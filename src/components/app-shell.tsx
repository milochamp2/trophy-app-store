"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Menu, X, User, LogOut, Settings, Home } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TenantSwitcher } from "@/components/tenant-switcher";
import { cn } from "@/lib/utils";
import type { Profile, MembershipWithTenant } from "@/db/database.types";

interface AppShellProps {
  children: React.ReactNode;
  profile: Profile | null;
  memberships: MembershipWithTenant[];
  currentTenantSlug?: string;
  variant?: "player" | "admin";
}

export function AppShell({
  children,
  profile,
  memberships,
  currentTenantSlug,
  variant = "player",
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const currentMembership = memberships.find(
    (m) => m.tenant.slug === currentTenantSlug
  );
  const currentTenant = currentMembership?.tenant;

  const isAdmin = variant === "admin";
  const basePath = isAdmin ? "/admin" : "/player";

  const navigation = isAdmin
    ? [
        { name: "Overview", href: `/admin/${currentTenantSlug}` },
        { name: "Players", href: `/admin/${currentTenantSlug}/players` },
        { name: "Trophies", href: `/admin/${currentTenantSlug}/trophies` },
        { name: "Awards", href: `/admin/${currentTenantSlug}/awards` },
      ]
    : currentTenantSlug
    ? [
        { name: "Trophy Cabinet", href: `/player/${currentTenantSlug}/cabinet` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            <Link href={basePath} className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              <span className="font-bold text-lg hidden sm:inline">
                Digital Trophy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {currentTenantSlug && (
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side: Tenant Switcher + Profile */}
          <div className="flex items-center gap-4">
            {memberships.length > 0 && (
              <TenantSwitcher
                memberships={memberships}
                currentTenantSlug={currentTenantSlug}
                variant={variant}
              />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      alt={profile?.display_name || "User"}
                    />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.display_name || "User"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/player">
                    <Home className="mr-2 h-4 w-4" />
                    My Clubs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="flex w-full items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && currentTenantSlug && (
          <nav className="md:hidden border-t px-4 py-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Current Tenant Banner */}
      {currentTenant && (
        <div className="border-b bg-muted/50">
          <div className="container px-4 py-2">
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Managing" : "Viewing"}: <strong>{currentTenant.name}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container px-4 py-6">{children}</main>
    </div>
  );
}
