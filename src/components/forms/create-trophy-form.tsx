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
import {
  createTrophyTemplateSchema,
  type CreateTrophyTemplateInput,
} from "@/lib/validations";
import { createTrophyTemplate } from "@/server/actions/trophies";

interface CreateTrophyFormProps {
  tenantId: string;
  onSuccess?: () => void;
}

export function CreateTrophyForm({
  tenantId,
  onSuccess,
}: CreateTrophyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTrophyTemplateInput>({
    resolver: zodResolver(createTrophyTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      tier: null,
      points: 0,
    },
  });

  const onSubmit = async (data: CreateTrophyTemplateInput) => {
    setIsLoading(true);

    try {
      const result = await createTrophyTemplate(tenantId, data);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Trophy created",
        description: "The trophy template has been created successfully.",
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
        <Label htmlFor="name">Trophy Name</Label>
        <Input
          id="name"
          placeholder="Player of the Month"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Awarded to the outstanding player each month"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tier">Tier</Label>
          <Select
            value={watch("tier") || ""}
            onValueChange={(value) =>
              setValue("tier", value as "gold" | "silver" | "bronze" | "special")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="special">Special</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            min="0"
            {...register("points", { valueAsNumber: true })}
          />
          {errors.points && (
            <p className="text-sm text-destructive">{errors.points.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Trophy
      </Button>
    </form>
  );
}
