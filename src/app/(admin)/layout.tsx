import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserTenants } from "@/server/actions/tenants";
import { getProfile } from "@/server/actions/auth";
import { AppShell } from "@/components/app-shell";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, memberships] = await Promise.all([
    getProfile(),
    getUserTenants(),
  ]);

  // Filter to only show tenants where user is admin/staff/owner
  const adminMemberships = memberships.filter((m) =>
    ["owner", "admin", "staff"].includes(m.role)
  );

  // Get tenantSlug from the URL if it exists
  const tenantSlug = params.tenantSlug;

  return (
    <AppShell
      profile={profile}
      memberships={adminMemberships}
      currentTenantSlug={tenantSlug}
      variant="admin"
    >
      {children}
    </AppShell>
  );
}
