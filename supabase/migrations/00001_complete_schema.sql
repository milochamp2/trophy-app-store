-- =============================================================================
-- Digital Trophy App - Complete Database Schema
-- Enterprise-ready multi-tenant schema with Row Level Security
-- =============================================================================

-- ============================================
-- PART 1: EXTENSIONS
-- ============================================

create extension if not exists "pgcrypto";

-- ============================================
-- PART 2: TABLES
-- ============================================

-- Tenants (Clubs/Organizations)
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive'
    check (subscription_status in ('inactive', 'trialing', 'active', 'past_due', 'canceled')),
  created_at timestamptz not null default now(),

  -- Enforce lowercase, URL-safe slug
  constraint slug_lowercase check (slug = lower(slug)),
  constraint slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' or length(slug) = 1)
);

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Memberships (tenant <-> user relationship)
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'staff', 'player')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),

  unique(tenant_id, user_id)
);

-- Seasons
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),

  constraint valid_date_range check (start_date is null or end_date is null or start_date <= end_date)
);

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now()
);

-- Trophy Templates
create table public.trophy_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  icon_url text,
  created_at timestamptz not null default now()
);

-- Awards (trophies awarded to users)
create table public.awards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  trophy_template_id uuid not null references public.trophy_templates(id) on delete restrict,
  season_id uuid references public.seasons(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  recipient_user_id uuid not null references auth.users(id) on delete restrict,
  awarded_by_user_id uuid not null references auth.users(id) on delete restrict,
  awarded_at timestamptz not null default now(),
  notes text
);

-- Invite Codes
create table public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null unique,
  role_default text not null default 'player'
    check (role_default in ('admin', 'staff', 'player')),
  expires_at timestamptz,
  max_uses int not null default 1,
  uses_count int not null default 0,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),

  constraint valid_uses check (uses_count >= 0 and max_uses >= 1)
);

-- ============================================
-- PART 3: INDEXES
-- ============================================

-- Tenant-scoped table indexes
create index idx_memberships_tenant_id on public.memberships(tenant_id);
create index idx_memberships_user_id on public.memberships(user_id);
create index idx_memberships_tenant_user on public.memberships(tenant_id, user_id);
create index idx_seasons_tenant_id on public.seasons(tenant_id);
create index idx_teams_tenant_id on public.teams(tenant_id);
create index idx_teams_season_id on public.teams(season_id);
create index idx_trophy_templates_tenant_id on public.trophy_templates(tenant_id);
create index idx_awards_tenant_id on public.awards(tenant_id);
create index idx_awards_recipient on public.awards(recipient_user_id);
create index idx_awards_tenant_awarded on public.awards(tenant_id, awarded_at desc);
create index idx_awards_template on public.awards(trophy_template_id);
create index idx_invite_codes_tenant_id on public.invite_codes(tenant_id);
create index idx_invite_codes_code on public.invite_codes(code);
create index idx_tenants_slug on public.tenants(slug);

-- ============================================
-- PART 4: HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Get current authenticated user ID
create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid()
$$;

-- Check if user is an active member of a tenant
create or replace function public.is_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where tenant_id = p_tenant_id
      and user_id = auth.uid()
      and status = 'active'
  )
$$;

-- Alias for is_member
create or replace function public.is_active_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_member(p_tenant_id)
$$;

-- Check if user has one of the specified roles in a tenant
create or replace function public.has_role(p_tenant_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where tenant_id = p_tenant_id
      and user_id = auth.uid()
      and status = 'active'
      and role = any(p_roles)
  )
$$;

-- Check if user is owner or admin
create or replace function public.is_admin(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(p_tenant_id, array['owner', 'admin'])
$$;

-- Check if user is owner
create or replace function public.is_owner(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(p_tenant_id, array['owner'])
$$;

-- Check if user is staff or above (owner, admin, staff)
create or replace function public.is_staff_or_above(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(p_tenant_id, array['owner', 'admin', 'staff'])
$$;

-- Generate random invite code
create or replace function public.generate_invite_code(p_length int default 8)
returns text
language sql
volatile
as $$
  select upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for p_length))
$$;

-- Create tenant with owner (atomic operation)
create or replace function public.create_tenant_with_owner(
  p_tenant_name text,
  p_tenant_slug text,
  p_tenant_logo_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return jsonb_build_object('error', 'Not authenticated');
  end if;

  -- Check if slug is already taken
  if exists (select 1 from public.tenants where slug = lower(p_tenant_slug)) then
    return jsonb_build_object('error', 'Slug already taken');
  end if;

  -- Create tenant
  insert into public.tenants (name, slug, logo_url)
  values (p_tenant_name, lower(p_tenant_slug), p_tenant_logo_url)
  returning id into v_tenant_id;

  -- Create owner membership
  insert into public.memberships (tenant_id, user_id, role, status)
  values (v_tenant_id, v_user_id, 'owner', 'active');

  return jsonb_build_object(
    'success', true,
    'tenant_id', v_tenant_id
  );
end;
$$;

-- Join tenant with invite code
create or replace function public.join_tenant_with_invite_code(p_invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite invite_codes%rowtype;
  v_user_id uuid;
  v_membership_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return jsonb_build_object('error', 'Not authenticated');
  end if;

  -- Find and validate invite code
  select * into v_invite
  from public.invite_codes
  where code = upper(p_invite_code)
    and (expires_at is null or expires_at > now())
    and uses_count < max_uses;

  if v_invite is null then
    return jsonb_build_object('error', 'Invalid or expired invite code');
  end if;

  -- Check if user is already a member
  if exists (
    select 1 from public.memberships
    where tenant_id = v_invite.tenant_id and user_id = v_user_id
  ) then
    return jsonb_build_object('error', 'Already a member of this organization');
  end if;

  -- Create membership
  insert into public.memberships (tenant_id, user_id, role, status)
  values (v_invite.tenant_id, v_user_id, v_invite.role_default, 'active')
  returning id into v_membership_id;

  -- Increment uses count
  update public.invite_codes
  set uses_count = uses_count + 1
  where id = v_invite.id;

  return jsonb_build_object(
    'success', true,
    'membership_id', v_membership_id,
    'tenant', (select jsonb_build_object('id', id, 'name', name, 'slug', slug) from tenants where id = v_invite.tenant_id)
  );
end;
$$;

-- ============================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ============================================

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.seasons enable row level security;
alter table public.teams enable row level security;
alter table public.trophy_templates enable row level security;
alter table public.awards enable row level security;
alter table public.invite_codes enable row level security;

-- ============================================
-- PART 6: RLS POLICIES
-- ============================================

-- ----------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------

-- Users can view any profile (for displaying names/avatars)
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can insert their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Users can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ----------------------------------------
-- TENANTS POLICIES
-- ----------------------------------------

-- Active members can view their tenant
create policy "tenants_select_member"
  on public.tenants for select
  to authenticated
  using (public.is_member(id));

-- Authenticated users can create tenants (via create_tenant_with_owner function)
create policy "tenants_insert_authenticated"
  on public.tenants for insert
  to authenticated
  with check (auth.uid() is not null);

-- Owner/admin can update tenant
create policy "tenants_update_admin"
  on public.tenants for update
  to authenticated
  using (public.is_admin(id))
  with check (public.is_admin(id));

-- Only owner can delete tenant
create policy "tenants_delete_owner"
  on public.tenants for delete
  to authenticated
  using (public.is_owner(id));

-- ----------------------------------------
-- MEMBERSHIPS POLICIES
-- ----------------------------------------

-- Users can view their own memberships
create policy "memberships_select_own"
  on public.memberships for select
  to authenticated
  using (user_id = auth.uid());

-- Admin/owner can view all memberships in their tenant
create policy "memberships_select_admin"
  on public.memberships for select
  to authenticated
  using (public.is_admin(tenant_id));

-- Owner/admin can insert memberships
create policy "memberships_insert_admin"
  on public.memberships for insert
  to authenticated
  with check (public.is_admin(tenant_id));

-- Owner/admin can update memberships (but not their own role to prevent lockout)
create policy "memberships_update_admin"
  on public.memberships for update
  to authenticated
  using (public.is_admin(tenant_id))
  with check (public.is_admin(tenant_id));

-- Owner/admin can delete memberships (but not their own)
create policy "memberships_delete_admin"
  on public.memberships for delete
  to authenticated
  using (public.is_admin(tenant_id) and user_id != auth.uid());

-- ----------------------------------------
-- SEASONS POLICIES
-- ----------------------------------------

-- Active members can view seasons
create policy "seasons_select_member"
  on public.seasons for select
  to authenticated
  using (public.is_member(tenant_id));

-- Owner/admin can insert seasons
create policy "seasons_insert_admin"
  on public.seasons for insert
  to authenticated
  with check (public.is_admin(tenant_id));

-- Owner/admin can update seasons
create policy "seasons_update_admin"
  on public.seasons for update
  to authenticated
  using (public.is_admin(tenant_id))
  with check (public.is_admin(tenant_id));

-- Owner/admin can delete seasons
create policy "seasons_delete_admin"
  on public.seasons for delete
  to authenticated
  using (public.is_admin(tenant_id));

-- ----------------------------------------
-- TEAMS POLICIES
-- ----------------------------------------

-- Active members can view teams
create policy "teams_select_member"
  on public.teams for select
  to authenticated
  using (public.is_member(tenant_id));

-- Owner/admin can insert teams
create policy "teams_insert_admin"
  on public.teams for insert
  to authenticated
  with check (public.is_admin(tenant_id));

-- Owner/admin can update teams
create policy "teams_update_admin"
  on public.teams for update
  to authenticated
  using (public.is_admin(tenant_id))
  with check (public.is_admin(tenant_id));

-- Owner/admin can delete teams
create policy "teams_delete_admin"
  on public.teams for delete
  to authenticated
  using (public.is_admin(tenant_id));

-- ----------------------------------------
-- TROPHY_TEMPLATES POLICIES
-- ----------------------------------------

-- Active members can view trophy templates
create policy "trophy_templates_select_member"
  on public.trophy_templates for select
  to authenticated
  using (public.is_member(tenant_id));

-- Owner/admin can insert trophy templates
create policy "trophy_templates_insert_admin"
  on public.trophy_templates for insert
  to authenticated
  with check (public.is_admin(tenant_id));

-- Owner/admin can update trophy templates
create policy "trophy_templates_update_admin"
  on public.trophy_templates for update
  to authenticated
  using (public.is_admin(tenant_id))
  with check (public.is_admin(tenant_id));

-- Owner/admin can delete trophy templates
create policy "trophy_templates_delete_admin"
  on public.trophy_templates for delete
  to authenticated
  using (public.is_admin(tenant_id));

-- ----------------------------------------
-- AWARDS POLICIES
-- ----------------------------------------

-- Staff and above can view all awards in tenant
create policy "awards_select_staff"
  on public.awards for select
  to authenticated
  using (public.is_staff_or_above(tenant_id));

-- Players can view their own awards
create policy "awards_select_recipient"
  on public.awards for select
  to authenticated
  using (
    recipient_user_id = auth.uid()
    and public.is_member(tenant_id)
  );

-- Staff and above can insert awards
create policy "awards_insert_staff"
  on public.awards for insert
  to authenticated
  with check (public.is_staff_or_above(tenant_id));

-- Owner/admin can update awards
create policy "awards_update_admin"
  on public.awards for update
  to authenticated
  using (public.is_admin(tenant_id))
  with check (public.is_admin(tenant_id));

-- Owner/admin can delete awards
create policy "awards_delete_admin"
  on public.awards for delete
  to authenticated
  using (public.is_admin(tenant_id));

-- ----------------------------------------
-- INVITE_CODES POLICIES
-- ----------------------------------------

-- Owner/admin can view invite codes
create policy "invite_codes_select_admin"
  on public.invite_codes for select
  to authenticated
  using (public.is_admin(tenant_id));

-- Owner/admin can insert invite codes
create policy "invite_codes_insert_admin"
  on public.invite_codes for insert
  to authenticated
  with check (public.is_admin(tenant_id));

-- Owner/admin can update invite codes
create policy "invite_codes_update_admin"
  on public.invite_codes for update
  to authenticated
  using (public.is_admin(tenant_id))
  with check (public.is_admin(tenant_id));

-- Owner/admin can delete invite codes
create policy "invite_codes_delete_admin"
  on public.invite_codes for delete
  to authenticated
  using (public.is_admin(tenant_id));

-- ============================================
-- PART 7: TRIGGERS
-- ============================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update timestamp trigger
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at columns and triggers where needed
alter table public.tenants add column if not exists updated_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();
alter table public.memberships add column if not exists updated_at timestamptz default now();

create trigger tenants_updated_at
  before update on public.tenants
  for each row execute procedure public.update_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger memberships_updated_at
  before update on public.memberships
  for each row execute procedure public.update_updated_at();

-- ============================================
-- PART 8: SEED DATA (COMMENTED OUT)
-- ============================================

/*
-- Demo seed data - uncomment and replace UUIDs as needed

-- Insert demo tenant
insert into public.tenants (id, name, slug, subscription_status)
values (
  '00000000-0000-0000-0000-000000000001',
  'Demo Sports Club',
  'demo-sports-club',
  'active'
);

-- Insert demo owner membership (replace user_id with actual auth.users id)
-- First, ensure user exists in auth.users, then:
insert into public.memberships (tenant_id, user_id, role, status)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002', -- Replace with actual user UUID
  'owner',
  'active'
);

-- Insert demo season
insert into public.seasons (tenant_id, name, start_date, end_date)
values (
  '00000000-0000-0000-0000-000000000001',
  'Season 2024',
  '2024-01-01',
  '2024-12-31'
);

-- Insert demo trophy template
insert into public.trophy_templates (tenant_id, name, description)
values (
  '00000000-0000-0000-0000-000000000001',
  'Player of the Month',
  'Awarded to the outstanding player each month'
);

-- Insert demo invite code
insert into public.invite_codes (tenant_id, code, role_default, max_uses)
values (
  '00000000-0000-0000-0000-000000000001',
  'DEMO2024',
  'player',
  100
);
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
