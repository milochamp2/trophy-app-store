"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Trophy } from "lucide-react";
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
import { deleteAward } from "@/server/actions/awards";
import type { AwardWithDetails } from "@/db/database.types";

interface AwardsTableProps {
  awards: AwardWithDetails[];
}

export function AwardsTable({ awards }: AwardsTableProps) {
  const { toast } = useToast();

  const handleDelete = async (awardId: string, trophyName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove this "${trophyName}" award? This cannot be undone.`
      )
    ) {
      return;
    }

    const result = await deleteAward(awardId);

    if (result.success) {
      toast({
        title: "Award removed",
        description: "The award has been removed successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<AwardWithDetails>[] = [
    {
      accessorKey: "trophy_template.name",
      header: "Trophy",
      cell: ({ row }) => {
        const trophy = row.original.trophy_template;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${getTierBackground(
                trophy?.tier
              )}`}
            >
              <Trophy
                className={`h-4 w-4 ${getTierColor(trophy?.tier)}`}
              />
            </div>
            <span className="font-medium">{trophy?.name || "Unknown"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "recipient.display_name",
      header: "Recipient",
      cell: ({ row }) => {
        const recipient = row.original.recipient;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={recipient?.avatar_url || undefined}
                alt={recipient?.display_name || "Player"}
              />
              <AvatarFallback className="text-xs">
                {recipient?.display_name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span>{recipient?.display_name || "Unknown"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "awarded_by.display_name",
      header: "Awarded By",
      cell: ({ row }) => {
        const awardedBy = row.original.awarded_by;
        return awardedBy?.display_name || "Unknown";
      },
    },
    {
      accessorKey: "trophy_template.tier",
      header: "Tier",
      cell: ({ row }) => {
        const tier = row.original.trophy_template?.tier;
        if (!tier) return <span className="text-muted-foreground">-</span>;
        return (
          <Badge
            variant={
              tier === "gold"
                ? "gold"
                : tier === "silver"
                ? "silver"
                : tier === "bronze"
                ? "bronze"
                : "secondary"
            }
            className="capitalize"
          >
            {tier}
          </Badge>
        );
      },
    },
    {
      accessorKey: "awarded_at",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("awarded_at") as string;
        return formatDate(date);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const award = row.original;

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
              <DropdownMenuItem
                onClick={() =>
                  handleDelete(award.id, award.trophy_template?.name || "Award")
                }
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Award
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">All Awards ({awards.length})</h2>
      <DataTable
        columns={columns}
        data={awards}
        searchKey="recipient.display_name"
        searchPlaceholder="Search by recipient..."
      />
    </div>
  );
}

function getTierColor(tier: string | null | undefined): string {
  switch (tier) {
    case "gold":
      return "text-amber-500";
    case "silver":
      return "text-gray-400";
    case "bronze":
      return "text-orange-700";
    case "special":
      return "text-purple-500";
    default:
      return "text-muted-foreground";
  }
}

function getTierBackground(tier: string | null | undefined): string {
  switch (tier) {
    case "gold":
      return "bg-amber-100";
    case "silver":
      return "bg-gray-100";
    case "bronze":
      return "bg-orange-100";
    case "special":
      return "bg-purple-100";
    default:
      return "bg-muted";
  }
}
