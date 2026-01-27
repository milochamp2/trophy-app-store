"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { updateMembership, removeMembership } from "@/server/actions/memberships";
import type { MembershipWithProfile } from "@/db/database.types";

interface PlayersTableProps {
  members: MembershipWithProfile[];
}

export function PlayersTable({ members }: PlayersTableProps) {
  const { toast } = useToast();

  const handleRoleChange = async (
    membershipId: string,
    newRole: "admin" | "staff" | "player"
  ) => {
    const result = await updateMembership(membershipId, {
      role: newRole,
      status: "active",
    });

    if (result.success) {
      toast({
        title: "Role updated",
        description: "Member role has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    const result = await removeMembership(membershipId);

    if (result.success) {
      toast({
        title: "Member removed",
        description: "Member has been removed from the club.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<MembershipWithProfile>[] = [
    {
      accessorKey: "profile.display_name",
      header: "Name",
      cell: ({ row }) => {
        const profile = row.original.profile;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={profile?.display_name || "Member"}
              />
              <AvatarFallback>
                {profile?.display_name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {profile?.display_name || "Unknown"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge
            variant={
              role === "owner"
                ? "default"
                : role === "admin"
                ? "secondary"
                : "outline"
            }
            className="capitalize"
          >
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "active" ? "default" : "secondary"}
            className="capitalize"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "joined_at",
      header: "Joined",
      cell: ({ row }) => {
        const joinedAt = row.getValue("joined_at") as string;
        return joinedAt ? formatDate(joinedAt) : "Pending";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const membership = row.original;
        const isOwner = membership.role === "owner";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isOwner && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange(membership.id, "admin")}
                    disabled={membership.role === "admin"}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange(membership.id, "staff")}
                    disabled={membership.role === "staff"}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Make Staff
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange(membership.id, "player")}
                    disabled={membership.role === "player"}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Make Player
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleRemoveMember(membership.id)}
                    className="text-destructive"
                  >
                    Remove from club
                  </DropdownMenuItem>
                </>
              )}
              {isOwner && (
                <DropdownMenuItem disabled>
                  Cannot modify owner
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Members ({members.length})</h2>
      <DataTable
        columns={columns}
        data={members}
        searchKey="profile.display_name"
        searchPlaceholder="Search members..."
      />
    </div>
  );
}
