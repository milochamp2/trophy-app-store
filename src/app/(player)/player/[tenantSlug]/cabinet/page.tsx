export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Trophy, Award, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTenantBySlug } from "@/server/actions/tenants";
import { getUserAwards } from "@/server/actions/awards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface CabinetPageProps {
  params: {
    tenantSlug: string;
  };
}

export default async function CabinetPage({ params }: CabinetPageProps) {
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

  const awards = await getUserAwards(tenant.id, user.id);

  // Calculate stats
  const totalPoints = awards.reduce(
    (acc, award) => acc + (award.trophy_template?.points || 0),
    0
  );

  const tierCounts = awards.reduce(
    (acc, award) => {
      const tier = award.trophy_template?.tier || "other";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Trophy Cabinet</h1>
        <p className="text-muted-foreground">
          Your achievements at {tenant.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Trophies"
          value={awards.length.toString()}
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Points"
          value={totalPoints.toString()}
          icon={<Award className="h-5 w-5" />}
        />
        <StatsCard
          title="Gold Trophies"
          value={(tierCounts["gold"] || 0).toString()}
          icon={<Trophy className="h-5 w-5 text-amber-500" />}
        />
        <StatsCard
          title="Silver Trophies"
          value={(tierCounts["silver"] || 0).toString()}
          icon={<Trophy className="h-5 w-5 text-gray-400" />}
        />
      </div>

      {/* Awards Grid */}
      {awards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No trophies yet</h3>
            <p className="mt-2 text-muted-foreground">
              Your trophies will appear here once you receive them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((award) => (
            <Link
              key={award.id}
              href={`/player/${tenantSlug}/awards/${award.id}`}
            >
              <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="text-center pb-2">
                  {/* Trophy Icon with Tier Color */}
                  <div className="mx-auto mb-2">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getTierBackground(
                        award.trophy_template?.tier
                      )}`}
                    >
                      <Trophy
                        className={`h-8 w-8 ${getTierColor(
                          award.trophy_template?.tier
                        )}`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-lg">
                    {award.trophy_template?.name}
                  </CardTitle>
                  {award.trophy_template?.tier && (
                    <Badge
                      variant={
                        award.trophy_template.tier === "gold"
                          ? "gold"
                          : award.trophy_template.tier === "silver"
                          ? "silver"
                          : award.trophy_template.tier === "bronze"
                          ? "bronze"
                          : "secondary"
                      }
                      className="mt-1"
                    >
                      {award.trophy_template.tier}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="text-center">
                  {award.trophy_template?.description && (
                    <CardDescription className="line-clamp-2 mb-3">
                      {award.trophy_template.description}
                    </CardDescription>
                  )}
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(award.awarded_at)}</span>
                  </div>
                  {award.trophy_template?.points ? (
                    <p className="mt-2 text-sm font-medium text-amber-600">
                      +{award.trophy_template.points} points
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
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
