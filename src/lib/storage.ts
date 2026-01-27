import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "tenant-assets";

/**
 * Upload a file to tenant storage
 * Files are organized by tenant: tenant-assets/{tenantId}/{category}/{filename}
 */
export async function uploadTenantAsset(
  tenantId: string,
  category: "logos" | "icons" | "images",
  file: File
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${tenantId}/${category}/${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { error: uploadError.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return { url: publicUrl };
}

/**
 * Delete a file from tenant storage
 */
export async function deleteTenantAsset(
  filePath: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error("Delete error:", error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Get the path from a full storage URL
 */
export function getPathFromUrl(url: string): string | null {
  const bucketUrlPart = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = url.indexOf(bucketUrlPart);

  if (index === -1) return null;

  return url.substring(index + bucketUrlPart.length);
}

/**
 * Upload a tenant logo
 * Convenience wrapper for uploadTenantAsset
 */
export async function uploadTenantLogo(
  tenantId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { error: "File size must be less than 2MB" };
  }

  return uploadTenantAsset(tenantId, "logos", file);
}

/**
 * Upload a trophy icon
 * Convenience wrapper for uploadTenantAsset
 */
export async function uploadTrophyIcon(
  tenantId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  // Validate file size (max 1MB)
  if (file.size > 1 * 1024 * 1024) {
    return { error: "File size must be less than 1MB" };
  }

  return uploadTenantAsset(tenantId, "icons", file);
}
