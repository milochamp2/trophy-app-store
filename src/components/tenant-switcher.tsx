"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { MembershipWithTenant } from "@/db/database.types";

interface TenantSwitcherProps {
  memberships: MembershipWithTenant[];
  currentTenantSlug?: string;
  variant?: "player" | "admin";
}

export function TenantSwitcher({
  memberships,
  currentTenantSlug,
  variant = "player",
}: TenantSwitcherProps) {
  const router = useRouter();

  const currentMembership = memberships.find(
    (m) => m.tenant.slug === currentTenantSlug
  );

  // Filter memberships based on variant
  // Admin variant only shows memberships where user is admin/staff/owner
  const filteredMemberships =
    variant === "admin"
      ? memberships.filter((m) =>
          ["owner", "admin", "staff"].includes(m.role)
        )
      : memberships;

  const handleSelect = (slug: string) => {
    const basePath = variant === "admin" ? "/admin" : "/player";
    const targetPath =
      variant === "admin"
        ? `${basePath}/${slug}/players`
        : `${basePath}/${slug}/cabinet`;
    router.push(targetPath);
  };

  if (filteredMemberships.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {currentMembership?.tenant.name || "Select club"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel>
          {variant === "admin" ? "Manage Club" : "Switch Club"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredMemberships.map((membership) => (
          <DropdownMenuItem
            key={membership.id}
            onSelect={() => handleSelect(membership.tenant.slug)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{membership.tenant.name}</span>
            {membership.tenant.slug === currentTenantSlug && (
              <Check className="h-4 w-4 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
