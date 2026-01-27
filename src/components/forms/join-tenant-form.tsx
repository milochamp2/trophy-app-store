"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { joinTenantSchema, type JoinTenantInput } from "@/lib/validations";
import { joinTenantWithCode } from "@/server/actions/tenants";

interface JoinTenantFormProps {
  onSuccess?: () => void;
}

export function JoinTenantForm({ onSuccess }: JoinTenantFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinTenantInput>({
    resolver: zodResolver(joinTenantSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const onSubmit = async (data: JoinTenantInput) => {
    setIsLoading(true);

    try {
      const result = await joinTenantWithCode(data);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Joined club",
        description: "You have successfully joined the club!",
      });

      onSuccess?.();
      router.push(`/player/${result.data!.tenantSlug}/cabinet`);
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
        <Label htmlFor="inviteCode">Invite Code</Label>
        <Input
          id="inviteCode"
          placeholder="Enter your invite code"
          {...register("inviteCode")}
          className="uppercase"
        />
        {errors.inviteCode && (
          <p className="text-sm text-destructive">
            {errors.inviteCode.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter the invite code provided by your club administrator.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Join Club
      </Button>
    </form>
  );
}
