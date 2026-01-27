import Link from "next/link";
import { Plus, Trophy, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserTenants } from "@/server/actions/tenants";
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

export default async function PlayerHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const memberships = await getUserTenants();

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
