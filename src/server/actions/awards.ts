"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createAwardSchema, type CreateAwardInput } from "@/lib/validations";
import type { ActionResult } from "./auth";
import type { Award, AwardWithDetails } from "@/db/database.types";

export async function getTenantAwards(tenantId: string): Promise<AwardWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("awards")
    .select(`
      *,
      trophy_template:trophy_templates(*),
      recipient:profiles!awards_recipient_user_id_fkey(*),
      awarded_by:profiles!awards_awarded_by_user_id_fkey(*),
      season:seasons(*),
      team:teams(*)
    `)
    .eq("tenant_id", tenantId)
    .order("awarded_at", { ascending: false });

  if (error) {
    console.error("Error fetching awards:", error);
    return [];
  }

  return (data as AwardWithDetails[]) || [];
}

export async function getUserAwards(
  tenantId: string,
  userId: string
): Promise<AwardWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("awards")
    .select(`
      *,
      trophy_template:trophy_templates(*),
      recipient:profiles!awards_recipient_user_id_fkey(*),
      awarded_by:profiles!awards_awarded_by_user_id_fkey(*),
      season:seasons(*),
      team:teams(*)
    `)
    .eq("tenant_id", tenantId)
    .eq("recipient_user_id", userId)
    .order("awarded_at", { ascending: false });

  if (error) {
    console.error("Error fetching user awards:", error);
    return [];
  }

  return (data as AwardWithDetails[]) || [];
}

export async function getAwardById(
  awardId: string
): Promise<AwardWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("awards")
    .select(`
      *,
      trophy_template:trophy_templates(*),
      recipient:profiles!awards_recipient_user_id_fkey(*),
      awarded_by:profiles!awards_awarded_by_user_id_fkey(*),
      season:seasons(*),
      team:teams(*)
    `)
    .eq("id", awardId)
    .single();

  if (error) {
    console.error("Error fetching award:", error);
    return null;
  }

  return data as AwardWithDetails;
}

export async function createAward(
  tenantId: string,
  input: CreateAwardInput
): Promise<ActionResult<{ awardId: string }>> {
  const validated = createAwardSchema.safeParse(input);
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

  const { data, error } = await supabase
    .from("awards")
    .insert({
      tenant_id: tenantId,
      trophy_template_id: validated.data.trophyTemplateId,
      recipient_user_id: validated.data.recipientUserId,
      awarded_by_user_id: user.id,
      season_id: validated.data.seasonId,
      team_id: validated.data.teamId,
      notes: validated.data.notes,
      is_public: validated.data.isPublic,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/player");
  return { success: true, data: { awardId: data.id } };
}

export async function deleteAward(awardId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("awards").delete().eq("id", awardId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/player");
  return { success: true };
}

// Get seasons and teams for award form dropdowns
export async function getTenantSeasons(tenantId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }

  return data || [];
}

export async function getTenantTeams(tenantId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching teams:", error);
    return [];
  }

  return data || [];
}
