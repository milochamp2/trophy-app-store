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
import { createTenantSchema, type CreateTenantInput } from "@/lib/validations";
import { createTenant } from "@/server/actions/tenants";
import { slugify } from "@/lib/utils";

interface CreateTenantFormProps {
  onSuccess?: () => void;
}

export function CreateTenantForm({ onSuccess }: CreateTenantFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const name = watch("name");

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue("name", newName);
    setValue("slug", slugify(newName));
  };

  const onSubmit = async (data: CreateTenantInput) => {
    setIsLoading(true);

    try {
      const result = await createTenant(data);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Club created",
        description: "Your new club has been created successfully.",
      });

      onSuccess?.();
      router.push(`/admin/${data.slug}/players`);
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
        <Label htmlFor="name">Club Name</Label>
        <Input
          id="name"
          placeholder="My Sports Club"
          {...register("name")}
          onChange={handleNameChange}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL Slug</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/</span>
          <Input
            id="slug"
            placeholder="my-sports-club"
            {...register("slug")}
          />
        </div>
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          This will be used in URLs: /player/
          {watch("slug") || "your-slug"}/cabinet
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Club
      </Button>
    </form>
  );
}
