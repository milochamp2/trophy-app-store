export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Trophy, Award, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Tenant, AwardWithDetails } from "@/db/database.types";

interface CabinetPageProps {
  params: {
    tenantSlug: string;
  };
}

// Mock tenant data
const MOCK_TENANTS: Record<string, Tenant> = {
  "demo-sports-club": {
    id: "1",
    name: "Demo Sports Club",
    slug: "demo-sports-club",
    logo_url: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_subscription_status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "city-basketball": {
    id: "2",
    name: "City Basketball League",
    slug: "city-basketball",
    logo_url: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_subscription_status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "youth-soccer": {
    id: "3",
    name: "Youth Soccer Academy",
    slug: "youth-soccer",
    logo_url: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_subscription_status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Mock awards data
const MOCK_AWARDS: AwardWithDetails[] = [
  {
    id: "award-1",
    tenant_id: "1",
    trophy_template_id: "1",
    season_id: "1",
    team_id: null,
    recipient_user_id: "1",
    awarded_by_user_id: "2",
    awarded_at: "2024-01-15T10:00:00Z",
    notes: "Outstanding performance in the championship game!",
    is_public: true,
    created_at: "2024-01-15T10:00:00Z",
    trophy_template: {
      id: "1",
      tenant_id: "1",
      name: "Player of the Month",
      description: "Awarded to the outstanding player each month",
      icon_url: null,
      tier: "gold",
      points: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    recipient: {
      id: "1",
      display_name: "John Doe",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    awarded_by: {
      id: "2",
      display_name: "Coach Smith",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    season: {
      id: "1",
      tenant_id: "1",
      name: "Season 2024",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "award-2",
    tenant_id: "1",
    trophy_template_id: "2",
    season_id: "1",
    team_id: null,
    recipient_user_id: "1",
    awarded_by_user_id: "2",
    awarded_at: "2024-02-20T14:30:00Z",
    notes: null,
    is_public: true,
    created_at: "2024-02-20T14:30:00Z",
    trophy_template: {
      id: "2",
      tenant_id: "1",
      name: "Most Improved",
      description: "Recognizing significant improvement over the season",
      icon_url: null,
      tier: "silver",
      points: 75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    recipient: {
      id: "1",
      display_name: "John Doe",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    awarded_by: {
      id: "2",
      display_name: "Coach Smith",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    season: {
      id: "1",
      tenant_id: "1",
      name: "Season 2024",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "award-3",
    tenant_id: "1",
    trophy_template_id: "3",
    season_id: null,
    team_id: null,
    recipient_user_id: "1",
    awarded_by_user_id: "2",
    awarded_at: "2024-03-10T09:00:00Z",
    notes: "Great teamwork and leadership!",
    is_public: true,
    created_at: "2024-03-10T09:00:00Z",
    trophy_template: {
      id: "3",
      tenant_id: "1",
      name: "Team Spirit Award",
      description: "For exceptional teamwork and positive attitude",
      icon_url: null,
      tier: "bronze",
      points: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    recipient: {
      id: "1",
      display_name: "John Doe",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    awarded_by: {
      id: "2",
      display_name: "Coach Smith",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "award-4",
    tenant_id: "1",
    trophy_template_id: "4",
    season_id: null,
    team_id: null,
    recipient_user_id: "1",
    awarded_by_user_id: "2",
    awarded_at: "2024-04-05T16:00:00Z",
    notes: null,
    is_public: true,
    created_at: "2024-04-05T16:00:00Z",
    trophy_template: {
      id: "4",
      tenant_id: "1",
      name: "MVP Award",
      description: "Most Valuable Player of the tournament",
      icon_url: null,
      tier: "special",
      points: 150,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    recipient: {
      id: "1",
      display_name: "John Doe",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    awarded_by: {
      id: "2",
      display_name: "Coach Smith",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

async function getData(tenantSlug: string): Promise<{ tenant: Tenant | null; awards: AwardWithDetails[] }> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const { getTenantBySlug } = await import("@/server/actions/tenants");
    const { getUserAwards } = await import("@/server/actions/awards");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) {
      // Check if it's a mock tenant
      if (MOCK_TENANTS[tenantSlug]) {
        return { tenant: MOCK_TENANTS[tenantSlug], awards: MOCK_AWARDS };
      }
      return { tenant: null, awards: [] };
    }

    if (!user) {
      return { tenant, awards: MOCK_AWARDS };
    }

    const awards = await getUserAwards(tenant.id, user.id);
    return { tenant, awards: awards.length > 0 ? awards : MOCK_AWARDS };
  } catch {
    // Return mock data when Supabase is not configured
    const mockTenant = MOCK_TENANTS[tenantSlug];
    if (mockTenant) {
      return { tenant: mockTenant, awards: MOCK_AWARDS };
    }
    return { tenant: null, awards: [] };
  }
}

export default async function CabinetPage({ params }: CabinetPageProps) {
  const { tenantSlug } = params;
  const { tenant, awards } = await getData(tenantSlug);

  if (!tenant) {
    notFound();
  }

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
