export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Building2, Settings } from "lucide-react";
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
import { CreateTenantForm } from "@/components/forms/create-tenant-form";
import type { MembershipWithTenant } from "@/db/database.types";

// Mock data for preview mode
const MOCK_MEMBERSHIPS: MembershipWithTenant[] = [
  {
    id: "1",
    tenant_id: "1",
    user_id: "1",
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tenant: {
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
  },
  {
    id: "2",
    tenant_id: "2",
    user_id: "1",
    role: "admin",
    status: "active",
    joined_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tenant: {
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
  },
];

async function getMemberships(): Promise<MembershipWithTenant[]> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const { getUserTenants } = await import("@/server/actions/tenants");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Return mock data for preview
      return MOCK_MEMBERSHIPS;
    }

    return await getUserTenants();
  } catch {
    // Return mock data when Supabase is not configured
    return MOCK_MEMBERSHIPS;
  }
}

export default async function AdminHomePage() {
  const memberships = await getMemberships();

  // Filter to only show tenants where user is admin/staff/owner
  const adminMemberships = memberships.filter((m) =>
    ["owner", "admin", "staff"].includes(m.role)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your clubs, players, and trophies
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Club
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a New Club</DialogTitle>
              <DialogDescription>
                Create a new club to manage trophies and awards.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <CreateTenantForm />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clubs Grid */}
      {adminMemberships.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No clubs to manage</h3>
            <p className="mt-2 text-muted-foreground">
              Create a club to start managing trophies and awards.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4">Create Your First Club</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create a New Club</DialogTitle>
                  <DialogDescription>
                    Create a new club to manage trophies and awards.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <CreateTenantForm />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adminMemberships.map((membership) => (
            <Link
              key={membership.id}
              href={`/admin/${membership.tenant.slug}/players`}
            >
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {membership.tenant.name}
                    </CardTitle>
                    <Badge
                      variant={
                        membership.role === "owner"
                          ? "default"
                          : membership.role === "admin"
                          ? "secondary"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      {membership.role}
                    </Badge>
                  </div>
                  <CardDescription>/{membership.tenant.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Manage Club</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
