"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createAwardSchema, type CreateAwardInput } from "@/lib/validations";
import { createAward } from "@/server/actions/awards";
import type {
  TrophyTemplate,
  MembershipWithProfile,
  Season,
  Team,
} from "@/db/database.types";

interface CreateAwardFormProps {
  tenantId: string;
  trophyTemplates: TrophyTemplate[];
  members: MembershipWithProfile[];
  seasons: Season[];
  teams: Team[];
  onSuccess?: () => void;
}

export function CreateAwardForm({
  tenantId,
  trophyTemplates,
  members,
  seasons,
  teams,
  onSuccess,
}: CreateAwardFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAwardInput>({
    resolver: zodResolver(createAwardSchema),
    defaultValues: {
      trophyTemplateId: "",
      recipientUserId: "",
      seasonId: null,
      teamId: null,
      notes: "",
      isPublic: true,
    },
  });

  const onSubmit = async (data: CreateAwardInput) => {
    setIsLoading(true);

    try {
      const result = await createAward(tenantId, data);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Award created",
        description: "The award has been given successfully!",
      });

      onSuccess?.();
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trophyTemplateId">Trophy</Label>
        <Select
          value={watch("trophyTemplateId")}
          onValueChange={(value) => setValue("trophyTemplateId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a trophy" />
          </SelectTrigger>
          <SelectContent>
            {trophyTemplates.map((trophy) => (
              <SelectItem key={trophy.id} value={trophy.id}>
                {trophy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.trophyTemplateId && (
          <p className="text-sm text-destructive">
            {errors.trophyTemplateId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipientUserId">Recipient</Label>
        <Select
          value={watch("recipientUserId")}
          onValueChange={(value) => setValue("recipientUserId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a player" />
          </SelectTrigger>
          <SelectContent>
            {members.map((membership) => (
              <SelectItem key={membership.user_id} value={membership.user_id}>
                {membership.profile?.display_name || "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.recipientUserId && (
          <p className="text-sm text-destructive">
            {errors.recipientUserId.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="seasonId">Season (Optional)</Label>
          <Select
            value={watch("seasonId") || "none"}
            onValueChange={(value) =>
              setValue("seasonId", value === "none" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No season</SelectItem>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamId">Team (Optional)</Label>
          <Select
            value={watch("teamId") || "none"}
            onValueChange={(value) =>
              setValue("teamId", value === "none" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No team</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          placeholder="Add a personal note..."
          {...register("notes")}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Award Trophy
      </Button>
    </form>
  );
}
