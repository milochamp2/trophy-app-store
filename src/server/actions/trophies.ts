"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createTrophyTemplateSchema,
  type CreateTrophyTemplateInput,
} from "@/lib/validations";
import type { ActionResult } from "./auth";
import type { TrophyTemplate } from "@/db/database.types";

export async function getTenantTrophyTemplates(
  tenantId: string
): Promise<TrophyTemplate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trophy_templates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching trophy templates:", error);
    return [];
  }

  return data || [];
}

export async function createTrophyTemplate(
  tenantId: string,
  input: CreateTrophyTemplateInput
): Promise<ActionResult<{ trophyId: string }>> {
  const validated = createTrophyTemplateSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trophy_templates")
    .insert({
      tenant_id: tenantId,
      name: validated.data.name,
      description: validated.data.description,
      icon_url: validated.data.iconUrl,
      tier: validated.data.tier,
      points: validated.data.points,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true, data: { trophyId: data.id } };
}

export async function updateTrophyTemplate(
  trophyId: string,
  input: Partial<CreateTrophyTemplateInput>
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trophy_templates")
    .update({
      name: input.name,
      description: input.description,
      icon_url: input.iconUrl,
      tier: input.tier,
      points: input.points,
    })
    .eq("id", trophyId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteTrophyTemplate(
  trophyId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trophy_templates")
    .delete()
    .eq("id", trophyId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function getTrophyTemplate(
  trophyId: string
): Promise<TrophyTemplate | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trophy_templates")
    .select("*")
    .eq("id", trophyId)
    .single();

  if (error) {
    return null;
  }

  return data;
}
