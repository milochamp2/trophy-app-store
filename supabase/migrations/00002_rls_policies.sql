-- ===========================================
-- Digital Trophy App - Row Level Security Policies
-- Migration: 00002_rls_policies.sql
-- ===========================================

-- ===========================================
-- HELPER FUNCTIONS FOR RLS
-- ===========================================

-- Check if the current user has an active membership in a tenant
CREATE OR REPLACE FUNCTION is_member(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships
        WHERE tenant_id = check_tenant_id
        AND user_id = auth.uid()
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if the current user has specific roles in a tenant
CREATE OR REPLACE FUNCTION has_role(check_tenant_id UUID, allowed_roles membership_role[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships
        WHERE tenant_id = check_tenant_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role = ANY(allowed_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is admin or owner of a tenant
CREATE OR REPLACE FUNCTION is_admin(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_role(check_tenant_id, ARRAY['owner', 'admin']::membership_role[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is staff or higher in a tenant
CREATE OR REPLACE FUNCTION is_staff_or_above(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_role(check_tenant_id, ARRAY['owner', 'admin', 'staff']::membership_role[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get all tenant IDs where user has active membership
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT tenant_id FROM memberships
    WHERE user_id = auth.uid()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ===========================================
-- ENABLE RLS ON ALL TABLES
-- ===========================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE trophy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- PROFILES POLICIES
-- ===========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can view profiles of other members in their tenants
CREATE POLICY "Users can view profiles in shared tenants"
    ON profiles FOR SELECT
    USING (
        id IN (
            SELECT m.user_id FROM memberships m
            WHERE m.tenant_id IN (SELECT get_user_tenant_ids())
            AND m.status = 'active'
        )
    );

-- ===========================================
-- TENANTS POLICIES
-- ===========================================

-- Members can view tenants they belong to
CREATE POLICY "Members can view their tenants"
    ON tenants FOR SELECT
    USING (id IN (SELECT get_user_tenant_ids()));

-- Anyone authenticated can create a tenant (they become owner)
CREATE POLICY "Authenticated users can create tenants"
    ON tenants FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins/owners can update tenant
CREATE POLICY "Admins can update tenant"
    ON tenants FOR UPDATE
    USING (is_admin(id))
    WITH CHECK (is_admin(id));

-- Only owners can delete tenant
CREATE POLICY "Owners can delete tenant"
    ON tenants FOR DELETE
    USING (has_role(id, ARRAY['owner']::membership_role[]));

-- ===========================================
-- MEMBERSHIPS POLICIES
-- ===========================================

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
    ON memberships FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all memberships in their tenant
CREATE POLICY "Admins can view tenant memberships"
    ON memberships FOR SELECT
    USING (is_admin(tenant_id));

-- Staff can view memberships (for awarding trophies)
CREATE POLICY "Staff can view tenant memberships"
    ON memberships FOR SELECT
    USING (is_staff_or_above(tenant_id));

-- Admins can create memberships
CREATE POLICY "Admins can create memberships"
    ON memberships FOR INSERT
    WITH CHECK (is_admin(tenant_id));

-- Special case: User can create their own membership when using invite code
-- This is handled via a function that bypasses RLS (see below)

-- Admins can update memberships (but not demote owners unless they are owner)
CREATE POLICY "Admins can update memberships"
    ON memberships FOR UPDATE
    USING (is_admin(tenant_id))
    WITH CHECK (
        is_admin(tenant_id)
        -- Prevent demoting the last owner
        AND (
            role != 'owner'
            OR EXISTS (
                SELECT 1 FROM memberships m
                WHERE m.tenant_id = memberships.tenant_id
                AND m.role = 'owner'
                AND m.status = 'active'
                AND m.id != memberships.id
            )
        )
    );

-- Admins can delete memberships (except own if they're the only owner)
CREATE POLICY "Admins can delete memberships"
    ON memberships FOR DELETE
    USING (
        is_admin(tenant_id)
        AND (
            user_id != auth.uid()
            OR role != 'owner'
            OR EXISTS (
                SELECT 1 FROM memberships m
                WHERE m.tenant_id = memberships.tenant_id
                AND m.role = 'owner'
                AND m.status = 'active'
                AND m.id != memberships.id
            )
        )
    );

-- ===========================================
-- SEASONS POLICIES
-- ===========================================

-- Members can view seasons in their tenant
CREATE POLICY "Members can view seasons"
    ON seasons FOR SELECT
    USING (is_member(tenant_id));

-- Admins can create seasons
CREATE POLICY "Admins can create seasons"
    ON seasons FOR INSERT
    WITH CHECK (is_admin(tenant_id));

-- Admins can update seasons
CREATE POLICY "Admins can update seasons"
    ON seasons FOR UPDATE
    USING (is_admin(tenant_id))
    WITH CHECK (is_admin(tenant_id));

-- Admins can delete seasons
CREATE POLICY "Admins can delete seasons"
    ON seasons FOR DELETE
    USING (is_admin(tenant_id));

-- ===========================================
-- TEAMS POLICIES
-- ===========================================

-- Members can view teams in their tenant
CREATE POLICY "Members can view teams"
    ON teams FOR SELECT
    USING (is_member(tenant_id));

-- Admins can create teams
CREATE POLICY "Admins can create teams"
    ON teams FOR INSERT
    WITH CHECK (is_admin(tenant_id));

-- Admins can update teams
CREATE POLICY "Admins can update teams"
    ON teams FOR UPDATE
    USING (is_admin(tenant_id))
    WITH CHECK (is_admin(tenant_id));

-- Admins can delete teams
CREATE POLICY "Admins can delete teams"
    ON teams FOR DELETE
    USING (is_admin(tenant_id));

-- ===========================================
-- TROPHY TEMPLATES POLICIES
-- ===========================================

-- Members can view trophy templates in their tenant
CREATE POLICY "Members can view trophy templates"
    ON trophy_templates FOR SELECT
    USING (is_member(tenant_id));

-- Admins can create trophy templates
CREATE POLICY "Admins can create trophy templates"
    ON trophy_templates FOR INSERT
    WITH CHECK (is_admin(tenant_id));

-- Admins can update trophy templates
CREATE POLICY "Admins can update trophy templates"
    ON trophy_templates FOR UPDATE
    USING (is_admin(tenant_id))
    WITH CHECK (is_admin(tenant_id));

-- Admins can delete trophy templates
CREATE POLICY "Admins can delete trophy templates"
    ON trophy_templates FOR DELETE
    USING (is_admin(tenant_id));

-- ===========================================
-- AWARDS POLICIES
-- ===========================================

-- Players can view their own awards
CREATE POLICY "Players can view own awards"
    ON awards FOR SELECT
    USING (auth.uid() = recipient_user_id);

-- Admins and staff can view all awards in tenant
CREATE POLICY "Staff can view tenant awards"
    ON awards FOR SELECT
    USING (is_staff_or_above(tenant_id));

-- Members can view public awards in their tenant
CREATE POLICY "Members can view public awards"
    ON awards FOR SELECT
    USING (is_member(tenant_id) AND is_public = true);

-- Staff and admins can create awards
CREATE POLICY "Staff can create awards"
    ON awards FOR INSERT
    WITH CHECK (
        is_staff_or_above(tenant_id)
        AND awarded_by_user_id = auth.uid()
    );

-- Admins can update awards
CREATE POLICY "Admins can update awards"
    ON awards FOR UPDATE
    USING (is_admin(tenant_id))
    WITH CHECK (is_admin(tenant_id));

-- Admins can delete awards
CREATE POLICY "Admins can delete awards"
    ON awards FOR DELETE
    USING (is_admin(tenant_id));

-- ===========================================
-- INVITE CODES POLICIES
-- ===========================================

-- Admins can view invite codes in their tenant
CREATE POLICY "Admins can view invite codes"
    ON invite_codes FOR SELECT
    USING (is_admin(tenant_id));

-- Admins can create invite codes
CREATE POLICY "Admins can create invite codes"
    ON invite_codes FOR INSERT
    WITH CHECK (
        is_admin(tenant_id)
        AND created_by_user_id = auth.uid()
    );

-- Admins can update invite codes
CREATE POLICY "Admins can update invite codes"
    ON invite_codes FOR UPDATE
    USING (is_admin(tenant_id))
    WITH CHECK (is_admin(tenant_id));

-- Admins can delete invite codes
CREATE POLICY "Admins can delete invite codes"
    ON invite_codes FOR DELETE
    USING (is_admin(tenant_id));

-- ===========================================
-- SECURITY DEFINER FUNCTIONS FOR SPECIAL CASES
-- ===========================================

-- Function to join a tenant via invite code
-- Bypasses RLS to allow self-insert into memberships
CREATE OR REPLACE FUNCTION join_tenant_with_invite_code(invite_code_value VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_invite invite_codes%ROWTYPE;
    v_membership_id UUID;
    v_tenant tenants%ROWTYPE;
BEGIN
    -- Validate user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN json_build_object('error', 'Not authenticated');
    END IF;

    -- Find and validate invite code
    SELECT * INTO v_invite
    FROM invite_codes
    WHERE code = invite_code_value
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR uses_count < max_uses);

    IF v_invite IS NULL THEN
        RETURN json_build_object('error', 'Invalid or expired invite code');
    END IF;

    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM memberships
        WHERE tenant_id = v_invite.tenant_id
        AND user_id = auth.uid()
    ) THEN
        RETURN json_build_object('error', 'Already a member of this club');
    END IF;

    -- Create membership
    INSERT INTO memberships (tenant_id, user_id, role, status, joined_at)
    VALUES (v_invite.tenant_id, auth.uid(), v_invite.role_default, 'active', NOW())
    RETURNING id INTO v_membership_id;

    -- Increment invite code usage
    UPDATE invite_codes
    SET uses_count = uses_count + 1
    WHERE id = v_invite.id;

    -- Get tenant info
    SELECT * INTO v_tenant FROM tenants WHERE id = v_invite.tenant_id;

    RETURN json_build_object(
        'success', true,
        'membership_id', v_membership_id,
        'tenant', json_build_object(
            'id', v_tenant.id,
            'name', v_tenant.name,
            'slug', v_tenant.slug
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a tenant and add creator as owner
CREATE OR REPLACE FUNCTION create_tenant_with_owner(
    tenant_name VARCHAR,
    tenant_slug VARCHAR,
    tenant_logo_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_membership_id UUID;
BEGIN
    -- Validate user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN json_build_object('error', 'Not authenticated');
    END IF;

    -- Check if slug is already taken
    IF EXISTS (SELECT 1 FROM tenants WHERE slug = tenant_slug) THEN
        RETURN json_build_object('error', 'Club slug is already taken');
    END IF;

    -- Create tenant
    INSERT INTO tenants (name, slug, logo_url)
    VALUES (tenant_name, tenant_slug, tenant_logo_url)
    RETURNING id INTO v_tenant_id;

    -- Create owner membership
    INSERT INTO memberships (tenant_id, user_id, role, status, joined_at)
    VALUES (v_tenant_id, auth.uid(), 'owner', 'active', NOW())
    RETURNING id INTO v_membership_id;

    RETURN json_build_object(
        'success', true,
        'tenant_id', v_tenant_id,
        'membership_id', v_membership_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- STORAGE POLICIES
-- ===========================================

-- Create storage bucket for tenant assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to tenant-assets
CREATE POLICY "Authenticated users can upload tenant assets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'tenant-assets'
        AND auth.uid() IS NOT NULL
    );

-- Policy: Anyone can view public tenant assets
CREATE POLICY "Public can view tenant assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'tenant-assets');

-- Policy: Admins can update/delete their tenant's assets
-- Files should be organized as: tenant-assets/{tenant_id}/...
CREATE POLICY "Admins can manage tenant assets"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'tenant-assets'
        AND is_admin((storage.foldername(name))[1]::UUID)
    );

CREATE POLICY "Admins can delete tenant assets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'tenant-assets'
        AND is_admin((storage.foldername(name))[1]::UUID)
    );
