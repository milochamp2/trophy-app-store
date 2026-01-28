export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Trophy, Users } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreateTenantForm } from "@/components/forms/create-tenant-form";
import { JoinTenantForm } from "@/components/forms/join-tenant-form";
import type { MembershipWithTenant } from "@/db/database.types";

// Mock data for preview mode
const MOCK_MEMBERSHIPS: MembershipWithTenant[] = [
  {
    id: "1",
    tenant_id: "1",
    user_id: "1",
    role: "player",
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
    role: "player",
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
  {
    id: "3",
    tenant_id: "3",
    user_id: "1",
    role: "staff",
    status: "active",
    joined_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tenant: {
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

export default async function PlayerHomePage() {
  const memberships = await getMemberships();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Clubs</h1>
          <p className="text-muted-foreground">
            View your clubs and trophy collections
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Join or Create Club
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join or Create a Club</DialogTitle>
              <DialogDescription>
                Join an existing club with an invite code or create your own.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="join" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="join">Join Club</TabsTrigger>
                <TabsTrigger value="create">Create Club</TabsTrigger>
              </TabsList>
              <TabsContent value="join" className="mt-4">
                <JoinTenantForm />
              </TabsContent>
              <TabsContent value="create" className="mt-4">
                <CreateTenantForm />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clubs Grid */}
      {memberships.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No clubs yet</h3>
            <p className="mt-2 text-muted-foreground">
              Join a club with an invite code or create your own to get started.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4">Get Started</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Join or Create a Club</DialogTitle>
                  <DialogDescription>
                    Join an existing club with an invite code or create your own.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="join" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="join">Join Club</TabsTrigger>
                    <TabsTrigger value="create">Create Club</TabsTrigger>
                  </TabsList>
                  <TabsContent value="join" className="mt-4">
                    <JoinTenantForm />
                  </TabsContent>
                  <TabsContent value="create" className="mt-4">
                    <CreateTenantForm />
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((membership) => (
            <Link
              key={membership.id}
              href={`/player/${membership.tenant.slug}/cabinet`}
            >
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {membership.tenant.name}
                    </CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {membership.role}
                    </Badge>
                  </div>
                  <CardDescription>/{membership.tenant.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm">View Trophy Cabinet</span>
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
