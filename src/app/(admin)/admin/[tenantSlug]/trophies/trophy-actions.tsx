"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { deleteTrophyTemplate } from "@/server/actions/trophies";

interface TrophyActionsProps {
  trophyId: string;
  trophyName: string;
}

export function TrophyActions({ trophyId, trophyName }: TrophyActionsProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${trophyName}"? This will also delete all awards using this trophy.`
      )
    ) {
      return;
    }

    const result = await deleteTrophyTemplate(trophyId);

    if (result.success) {
      toast({
        title: "Trophy deleted",
        description: "The trophy template has been deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="absolute right-2 top-2 h-8 w-8 p-0"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Trophy
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
