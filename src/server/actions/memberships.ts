"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createInviteCodeSchema,
  updateMembershipSchema,
  type CreateInviteCodeInput,
  type UpdateMembershipInput,
} from "@/lib/validations";
import type { ActionResult } from "./auth";
import type { InviteCode, MembershipWithProfile } from "@/db/database.types";

export async function getTenantMembers(
  tenantId: string
): Promise<MembershipWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memberships")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching members:", error);
    return [];
  }

  return (data as MembershipWithProfile[]) || [];
}

export async function updateMembership(
  membershipId: string,
  input: UpdateMembershipInput
): Promise<ActionResult> {
  const validated = updateMembershipSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("memberships")
    .update({
      role: validated.data.role,
      status: validated.data.status,
    })
    .eq("id", membershipId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function removeMembership(
  membershipId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

// Invite Code Management
export async function createInviteCode(
  tenantId: string,
  input: CreateInviteCodeInput
): Promise<ActionResult<{ code: string }>> {
  const validated = createInviteCodeSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Generate a unique code
  const { data: codeData } = await supabase.rpc("generate_invite_code", {
    length: 8,
  });

  const code = codeData as string;

  const { error } = await supabase.from("invite_codes").insert({
    tenant_id: tenantId,
    code,
    role_default: validated.data.roleDefault,
    expires_at: validated.data.expiresAt,
    max_uses: validated.data.maxUses,
    created_by_user_id: user.id,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true, data: { code } };
}

export async function getTenantInviteCodes(
  tenantId: string
): Promise<InviteCode[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invite codes:", error);
    return [];
  }

  return data || [];
}

export async function deactivateInviteCode(
  codeId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("invite_codes")
    .update({ is_active: false })
    .eq("id", codeId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
