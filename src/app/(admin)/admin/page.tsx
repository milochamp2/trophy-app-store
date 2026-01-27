import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Building2, Settings } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { CreateTenantForm } from "@/components/forms/create-tenant-form";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const memberships = await getUserTenants();

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
