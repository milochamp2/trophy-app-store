import { z } from "zod";

// ===========================================
// Auth Schemas
// ===========================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    displayName: z.string().min(2, "Display name must be at least 2 characters").max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ===========================================
// Tenant Schemas
// ===========================================

export const createTenantSchema = z.object({
  name: z
    .string()
    .min(2, "Club name must be at least 2 characters")
    .max(255, "Club name must be less than 255 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

// ===========================================
// Membership Schemas
// ===========================================

export const joinTenantSchema = z.object({
  inviteCode: z
    .string()
    .min(6, "Invite code must be at least 6 characters")
    .max(20, "Invite code must be less than 20 characters")
    .toUpperCase(),
});

export const updateMembershipSchema = z.object({
  role: z.enum(["owner", "admin", "staff", "player"]),
  status: z.enum(["pending", "active", "suspended", "inactive"]),
});

export type JoinTenantInput = z.infer<typeof joinTenantSchema>;
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;

// ===========================================
// Season Schemas
// ===========================================

export const createSeasonSchema = z.object({
  name: z
    .string()
    .min(2, "Season name must be at least 2 characters")
    .max(255, "Season name must be less than 255 characters"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(false),
});

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;

// ===========================================
// Team Schemas
// ===========================================

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(255, "Team name must be less than 255 characters"),
  seasonId: z.string().uuid().optional().nullable(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

// ===========================================
// Trophy Template Schemas
// ===========================================

export const createTrophyTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "Trophy name must be at least 2 characters")
    .max(255, "Trophy name must be less than 255 characters"),
  description: z.string().max(1000).optional(),
  iconUrl: z.string().url().optional().nullable(),
  tier: z.enum(["gold", "silver", "bronze", "special"]).optional().nullable(),
  points: z.number().int().min(0).default(0),
});

export type CreateTrophyTemplateInput = z.infer<typeof createTrophyTemplateSchema>;

// ===========================================
// Award Schemas
// ===========================================

export const createAwardSchema = z.object({
  trophyTemplateId: z.string().uuid("Please select a trophy"),
  recipientUserId: z.string().uuid("Please select a recipient"),
  seasonId: z.string().uuid().optional().nullable(),
  teamId: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional(),
  isPublic: z.boolean().default(true),
});

export type CreateAwardInput = z.infer<typeof createAwardSchema>;

// ===========================================
// Invite Code Schemas
// ===========================================

export const createInviteCodeSchema = z.object({
  roleDefault: z.enum(["admin", "staff", "player"]).default("player"),
  expiresAt: z.string().optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
});

export type CreateInviteCodeInput = z.infer<typeof createInviteCodeSchema>;

// ===========================================
// Profile Schemas
// ===========================================

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(255)
    .optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
