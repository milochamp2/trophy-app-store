import { redirect, notFound } from "next/navigation";
import { Plus, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTenantBySlug } from "@/server/actions/tenants";
import { getTenantMembers } from "@/server/actions/memberships";
import { getTenantTrophyTemplates } from "@/server/actions/trophies";
import {
  getTenantAwards,
  getTenantSeasons,
  getTenantTeams,
} from "@/server/actions/awards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateAwardForm } from "@/components/forms/create-award-form";
import { AwardsTable } from "./awards-table";

interface AwardsPageProps {
  params: {
    tenantSlug: string;
  };
}

export default async function AwardsPage({ params }: AwardsPageProps) {
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

  const [awards, trophyTemplates, members, seasons, teams] = await Promise.all([
    getTenantAwards(tenant.id),
    getTenantTrophyTemplates(tenant.id),
    getTenantMembers(tenant.id),
    getTenantSeasons(tenant.id),
    getTenantTeams(tenant.id),
  ]);

  const canCreateAward = trophyTemplates.length > 0 && members.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Awards</h1>
          <p className="text-muted-foreground">
            Award trophies to players in {tenant.name}
          </p>
        </div>

        {canCreateAward ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Award Trophy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Award a Trophy</DialogTitle>
                <DialogDescription>
                  Select a trophy and player to create a new award.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <CreateAwardForm
                  tenantId={tenant.id}
                  trophyTemplates={trophyTemplates}
                  members={members}
                  seasons={seasons}
                  teams={teams}
                />
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Award Trophy
          </Button>
        )}
      </div>

      {/* Warning if cannot create award */}
      {!canCreateAward && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <p className="text-sm text-amber-800">
              {trophyTemplates.length === 0
                ? "Create a trophy template first before awarding trophies."
                : "Add members to your club before awarding trophies."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Awards List */}
      {awards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No awards yet</h3>
            <p className="mt-2 text-muted-foreground">
              Award your first trophy to a player to see it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <AwardsTable awards={awards} />
      )}
    </div>
  );
}
