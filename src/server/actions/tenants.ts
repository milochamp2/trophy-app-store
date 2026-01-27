"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createTenantSchema,
  joinTenantSchema,
  type CreateTenantInput,
  type JoinTenantInput,
} from "@/lib/validations";
import type { ActionResult } from "./auth";
import type { Tenant, MembershipWithTenant } from "@/db/database.types";

export async function createTenant(
  input: CreateTenantInput
): Promise<ActionResult<{ tenantId: string }>> {
  const validated = createTenantSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  // Use the security definer function to create tenant and owner membership
  const { data, error } = await supabase.rpc("create_tenant_with_owner", {
    tenant_name: validated.data.name,
    tenant_slug: validated.data.slug,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as { success?: boolean; tenant_id?: string; error?: string };

  if (result.error) {
    return { success: false, error: result.error };
  }

  revalidatePath("/player");
  revalidatePath("/admin");

  return { success: true, data: { tenantId: result.tenant_id! } };
}

export async function joinTenantWithCode(
  input: JoinTenantInput
): Promise<ActionResult<{ tenantSlug: string }>> {
  const validated = joinTenantSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("join_tenant_with_invite_code", {
    invite_code_value: validated.data.inviteCode,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as {
    success?: boolean;
    tenant?: { slug: string };
    error?: string;
  };

  if (result.error) {
    return { success: false, error: result.error };
  }

  revalidatePath("/player");

  return { success: true, data: { tenantSlug: result.tenant!.slug } };
}

export async function getUserTenants(): Promise<MembershipWithTenant[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memberships")
    .select(`
      *,
      tenant:tenants(*)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user tenants:", error);
    return [];
  }

  return (data as MembershipWithTenant[]) || [];
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching tenant:", error);
    return null;
  }

  return data;
}

export async function getUserMembershipInTenant(tenantId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function updateTenant(
  tenantId: string,
  updates: Partial<Pick<Tenant, "name" | "logo_url">>
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tenants")
    .update(updates)
    .eq("id", tenantId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
