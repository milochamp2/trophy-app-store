// ===========================================
// Database Types for Digital Trophy App
// ===========================================
// NOTE: This file can be auto-generated using:
// npm run db:generate-types
// After running Supabase migrations

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MembershipRole = "owner" | "admin" | "staff" | "player";
export type MembershipStatus = "pending" | "active" | "suspended" | "inactive";

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_subscription_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      memberships: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: MembershipRole;
          status: MembershipStatus;
          joined_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role?: MembershipRole;
          status?: MembershipStatus;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: MembershipRole;
          status?: MembershipStatus;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      seasons: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          start_date: string | null;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          tenant_id: string;
          season_id: string | null;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          season_id?: string | null;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          season_id?: string | null;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      trophy_templates: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          icon_url: string | null;
          tier: string | null;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          icon_url?: string | null;
          tier?: string | null;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          icon_url?: string | null;
          tier?: string | null;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      awards: {
        Row: {
          id: string;
          tenant_id: string;
          trophy_template_id: string;
          season_id: string | null;
          team_id: string | null;
          recipient_user_id: string;
          awarded_by_user_id: string;
          awarded_at: string;
          notes: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          trophy_template_id: string;
          season_id?: string | null;
          team_id?: string | null;
          recipient_user_id: string;
          awarded_by_user_id: string;
          awarded_at?: string;
          notes?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          trophy_template_id?: string;
          season_id?: string | null;
          team_id?: string | null;
          recipient_user_id?: string;
          awarded_by_user_id?: string;
          awarded_at?: string;
          notes?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
      };
      invite_codes: {
        Row: {
          id: string;
          tenant_id: string;
          code: string;
          role_default: MembershipRole;
          expires_at: string | null;
          max_uses: number | null;
          uses_count: number;
          created_by_user_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          code: string;
          role_default?: MembershipRole;
          expires_at?: string | null;
          max_uses?: number | null;
          uses_count?: number;
          created_by_user_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          code?: string;
          role_default?: MembershipRole;
          expires_at?: string | null;
          max_uses?: number | null;
          uses_count?: number;
          created_by_user_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_member: {
        Args: { check_tenant_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: { check_tenant_id: string; allowed_roles: MembershipRole[] };
        Returns: boolean;
      };
      is_admin: {
        Args: { check_tenant_id: string };
        Returns: boolean;
      };
      is_staff_or_above: {
        Args: { check_tenant_id: string };
        Returns: boolean;
      };
      get_user_tenant_ids: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      join_tenant_with_invite_code: {
        Args: { invite_code_value: string };
        Returns: Json;
      };
      create_tenant_with_owner: {
        Args: {
          tenant_name: string;
          tenant_slug: string;
          tenant_logo_url?: string | null;
        };
        Returns: Json;
      };
      generate_invite_code: {
        Args: { length?: number };
        Returns: string;
      };
    };
    Enums: {
      membership_role: MembershipRole;
      membership_status: MembershipStatus;
    };
  };
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Commonly used types
export type Tenant = Tables<"tenants">;
export type Profile = Tables<"profiles">;
export type Membership = Tables<"memberships">;
export type Season = Tables<"seasons">;
export type Team = Tables<"teams">;
export type TrophyTemplate = Tables<"trophy_templates">;
export type Award = Tables<"awards">;
export type InviteCode = Tables<"invite_codes">;

// Extended types with relations
export type MembershipWithTenant = Membership & {
  tenant: Tenant;
};

export type MembershipWithProfile = Membership & {
  profile: Profile;
};

export type AwardWithDetails = Award & {
  trophy_template: TrophyTemplate;
  recipient: Profile;
  awarded_by: Profile;
  season?: Season | null;
  team?: Team | null;
};
