import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Trophy, ArrowLeft, Calendar, User, Users, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTenantBySlug } from "@/server/actions/tenants";
import { getAwardById } from "@/server/actions/awards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/utils";

interface AwardDetailPageProps {
  params: {
    tenantSlug: string;
    awardId: string;
  };
}

export default async function AwardDetailPage({
  params,
}: AwardDetailPageProps) {
  const { tenantSlug, awardId } = params;

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

  const award = await getAwardById(awardId);
  if (!award || award.tenant_id !== tenant.id) {
    notFound();
  }

  const trophy = award.trophy_template;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <Button variant="ghost" asChild>
        <Link href={`/player/${tenantSlug}/cabinet`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cabinet
        </Link>
      </Button>

      {/* Trophy Card */}
      <Card>
        <CardHeader className="text-center pb-4">
          {/* Trophy Icon */}
          <div className="mx-auto mb-4">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getTierBackground(
                trophy?.tier
              )} trophy-shine`}
            >
              <Trophy
                className={`h-12 w-12 ${getTierColor(trophy?.tier)}`}
              />
            </div>
          </div>

          <CardTitle className="text-2xl">{trophy?.name}</CardTitle>

          {trophy?.tier && (
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
              className="mt-2 text-sm"
            >
              {trophy.tier.charAt(0).toUpperCase() + trophy.tier.slice(1)} Trophy
            </Badge>
          )}

          {trophy?.description && (
            <CardDescription className="mt-4 text-base">
              {trophy.description}
            </CardDescription>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-4">
          {/* Points */}
          {trophy?.points ? (
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="font-semibold text-amber-600">
                  +{trophy.points} points
                </p>
              </div>
            </div>
          ) : null}

          {/* Awarded Date */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Awarded On</p>
              <p className="font-medium">{formatDateTime(award.awarded_at)}</p>
            </div>
          </div>

          {/* Awarded By */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Awarded By</p>
              <p className="font-medium">
                {award.awarded_by?.display_name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Season */}
          {award.season && (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Season</p>
                <p className="font-medium">{award.season.name}</p>
              </div>
            </div>
          )}

          {/* Team */}
          {award.team && (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="font-medium">{award.team.name}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {award.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Note</p>
                <p className="text-sm bg-muted p-3 rounded-md italic">
                  &ldquo;{award.notes}&rdquo;
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
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
