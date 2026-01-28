export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { Plus, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTenantBySlug } from "@/server/actions/tenants";
import { getTenantTrophyTemplates } from "@/server/actions/trophies";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreateTrophyForm } from "@/components/forms/create-trophy-form";
import { TrophyActions } from "./trophy-actions";

interface TrophiesPageProps {
  params: {
    tenantSlug: string;
  };
}

export default async function TrophiesPage({ params }: TrophiesPageProps) {
  const { tenantSlug } = params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    notFound();
  }

  const trophyTemplates = await getTenantTrophyTemplates(tenant.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trophy Templates</h1>
          <p className="text-muted-foreground">
            Create and manage trophy templates for {tenant.name}
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Trophy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Trophy Template</DialogTitle>
              <DialogDescription>
                Create a new trophy template that can be awarded to players.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <CreateTrophyForm tenantId={tenant.id} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trophy Templates Grid */}
      {trophyTemplates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No trophy templates</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first trophy template to start awarding players.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4">Create Your First Trophy</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Trophy Template</DialogTitle>
                  <DialogDescription>
                    Create a new trophy template that can be awarded to players.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <CreateTrophyForm tenantId={tenant.id} />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trophyTemplates.map((trophy) => (
            <Card key={trophy.id} className="relative">
              <TrophyActions trophyId={trophy.id} trophyName={trophy.name} />
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getTierBackground(
                      trophy.tier
                    )}`}
                  >
                    <Trophy
                      className={`h-8 w-8 ${getTierColor(trophy.tier)}`}
                    />
                  </div>
                </div>
                <CardTitle className="text-lg">{trophy.name}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {trophy.tier && (
                    <Badge
                      variant={
                        trophy.tier === "gold"
                          ? "gold"
                          : trophy.tier === "silver"
                          ? "silver"
                          : trophy.tier === "bronze"
                          ? "bronze"
                          : "secondary"
                      }
                    >
                      {trophy.tier}
                    </Badge>
                  )}
                  {trophy.points > 0 && (
                    <Badge variant="outline">{trophy.points} pts</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                {trophy.description && (
                  <CardDescription className="line-clamp-2">
                    {trophy.description}
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function getTierColor(tier: string | null): string {
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

function getTierBackground(tier: string | null): string {
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
