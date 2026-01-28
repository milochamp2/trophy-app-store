import { AppShell } from "@/components/app-shell";
import type { Profile, MembershipWithTenant } from "@/db/database.types";

// Mock data for preview mode
const MOCK_PROFILE: Profile = {
  id: "demo-user-id",
  display_name: "Demo User",
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_MEMBERSHIPS: MembershipWithTenant[] = [
  {
    id: "1",
    tenant_id: "1",
    user_id: "demo-user-id",
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
    user_id: "demo-user-id",
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

async function getLayoutData(): Promise<{
  profile: Profile | null;
  memberships: MembershipWithTenant[];
}> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const { getUserTenants } = await import("@/server/actions/tenants");
    const { getProfile } = await import("@/server/actions/auth");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Return mock data for demo mode
      return { profile: MOCK_PROFILE, memberships: MOCK_MEMBERSHIPS };
    }

    const [profile, memberships] = await Promise.all([
      getProfile(),
      getUserTenants(),
    ]);

    // Filter to only show tenants where user is admin/staff/owner
    const adminMemberships = memberships.filter((m) =>
      ["owner", "admin", "staff"].includes(m.role)
    );

    return { profile, memberships: adminMemberships };
  } catch {
    // Return mock data when Supabase is not configured
    return { profile: MOCK_PROFILE, memberships: MOCK_MEMBERSHIPS };
  }
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug?: string };
}) {
  const { profile, memberships } = await getLayoutData();

  // Get tenantSlug from the URL if it exists
  const tenantSlug = params.tenantSlug;

  return (
    <AppShell
      profile={profile}
      memberships={memberships}
      currentTenantSlug={tenantSlug}
      variant="admin"
    >
      {children}
    </AppShell>
  );
}
