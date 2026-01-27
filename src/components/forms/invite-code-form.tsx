"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Copy, Check } from "lucide-react";
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
  createInviteCodeSchema,
  type CreateInviteCodeInput,
} from "@/lib/validations";
import { createInviteCode } from "@/server/actions/memberships";

interface InviteCodeFormProps {
  tenantId: string;
  onSuccess?: () => void;
}

export function InviteCodeForm({ tenantId, onSuccess }: InviteCodeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateInviteCodeInput>({
    resolver: zodResolver(createInviteCodeSchema),
    defaultValues: {
      roleDefault: "player",
      maxUses: null,
      expiresAt: null,
    },
  });

  const onSubmit = async (data: CreateInviteCodeInput) => {
    setIsLoading(true);

    try {
      const result = await createInviteCode(tenantId, data);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setGeneratedCode(result.data!.code);
      toast({
        title: "Invite code created",
        description: "Share this code with new members.",
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

  const copyToClipboard = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setGeneratedCode(null);
    reset();
  };

  if (generatedCode) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Share this invite code:
          </p>
          <div className="flex items-center justify-center gap-2">
            <code className="text-2xl font-mono font-bold tracking-wider">
              {generatedCode}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <Button variant="outline" onClick={handleReset} className="w-full">
          Generate Another Code
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="roleDefault">Default Role</Label>
        <Select
          value={watch("roleDefault")}
          onValueChange={(value) =>
            setValue("roleDefault", value as "admin" | "staff" | "player")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select default role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="player">Player</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          New members will be assigned this role when they join.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxUses">Max Uses (Optional)</Label>
        <Input
          id="maxUses"
          type="number"
          min="1"
          placeholder="Unlimited"
          {...register("maxUses", {
            setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
          })}
        />
        {errors.maxUses && (
          <p className="text-sm text-destructive">{errors.maxUses.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expires At (Optional)</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          {...register("expiresAt")}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty for a code that never expires.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Invite Code
      </Button>
    </form>
  );
}
