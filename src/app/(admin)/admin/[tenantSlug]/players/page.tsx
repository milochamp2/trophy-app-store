import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantBySlug } from "@/server/actions/tenants";
import { getTenantMembers, getTenantInviteCodes } from "@/server/actions/memberships";
import { PlayersTable } from "./players-table";
import { InviteCodesSection } from "./invite-codes-section";

interface PlayersPageProps {
  params: {
    tenantSlug: string;
  };
}

export default async function PlayersPage({ params }: PlayersPageProps) {
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

  const [members, inviteCodes] = await Promise.all([
    getTenantMembers(tenant.id),
    getTenantInviteCodes(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Players</h1>
        <p className="text-muted-foreground">
          Manage members and invite new players to {tenant.name}
        </p>
      </div>

      {/* Invite Codes Section */}
      <InviteCodesSection tenantId={tenant.id} inviteCodes={inviteCodes} />

      {/* Members Table */}
      <PlayersTable members={members} />
    </div>
  );
}
