# Digital Trophy

A multi-tenant web application for sports clubs and organizations to manage digital trophies and awards. Built with Next.js 14, Supabase, and TypeScript.

## Features

- **Multi-Tenant Architecture**: Each club/organization operates in isolation with full data separation
- **Row Level Security (RLS)**: Enterprise-grade security at the database level
- **Two Experiences**:
  - **Player Portal**: Mobile-responsive trophy cabinet and achievement viewing
  - **Admin Dashboard**: Manage clubs, players, trophy templates, and awards
- **Role-Based Access**: Owner, Admin, Staff, and Player roles
- **Invite System**: Generate codes to invite new members

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Validation**: Zod
- **Forms**: React Hook Form
- **Tables**: TanStack Table
- **Payments**: Stripe (scaffold only)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (for local Supabase)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd digital-trophy
npm install
```

### 2. Set Up Supabase

#### Option A: Local Development (Recommended)

1. Start Supabase locally:
   ```bash
   npx supabase start
   ```

2. The CLI will output your local credentials. Copy them for the next step.

3. Apply migrations:
   ```bash
   npx supabase db push
   ```

#### Option B: Supabase Cloud

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Run migrations against your cloud instance:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

### 3. Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your values:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321  # or your cloud URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server only!

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Stripe (optional for MVP)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 4. Configure Auth (Supabase Dashboard)

1. Go to Authentication > URL Configuration
2. Set Site URL: `http://localhost:3000`
3. Add Redirect URLs:
   - `http://localhost:3000/**`
   - `http://localhost:3000/login`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Marketing & auth pages
│   │   ├── page.tsx        # Landing page
│   │   ├── login/
│   │   └── register/
│   ├── (player)/           # Player portal
│   │   └── player/
│   │       ├── page.tsx    # Club list
│   │       └── [tenantSlug]/
│   │           ├── cabinet/    # Trophy cabinet
│   │           └── awards/     # Award details
│   ├── (admin)/            # Admin dashboard
│   │   └── admin/
│   │       ├── page.tsx    # Club management
│   │       └── [tenantSlug]/
│   │           ├── players/    # Member management
│   │           ├── trophies/   # Trophy templates
│   │           └── awards/     # Award management
│   ├── api/
│   │   ├── auth/logout/
│   │   └── stripe/webhook/
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   ├── app-shell.tsx       # Main layout
│   ├── data-table.tsx      # Reusable data table
│   └── tenant-switcher.tsx
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── utils.ts
│   ├── validations.ts      # Zod schemas
│   └── storage.ts          # File upload utilities
├── server/
│   └── actions/            # Server actions
├── db/
│   └── database.types.ts   # Generated types
└── middleware.ts           # Route protection

supabase/
├── config.toml
└── migrations/
    ├── 00001_initial_schema.sql
    └── 00002_rls_policies.sql
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `tenants` | Clubs/organizations (multi-tenant boundary) |
| `profiles` | User profiles (extends auth.users) |
| `memberships` | User-tenant relationships with roles |
| `seasons` | Time-bounded periods for organizing |
| `teams` | Groups within a tenant |
| `trophy_templates` | Reusable trophy definitions |
| `awards` | Trophy instances given to users |
| `invite_codes` | Codes for joining a tenant |

### Roles

- **Owner**: Full control, cannot be removed
- **Admin**: Manage members, trophies, awards
- **Staff**: Can award trophies, view members
- **Player**: View own awards and cabinet

## RLS Policies

All tenant-scoped tables have Row Level Security enabled:

- Users can only access data from tenants where they have active membership
- Admins/owners can manage tenant settings, members, and trophies
- Staff can view members and create awards
- Players can view their own awards and public awards

## Available Scripts

```bash
# Development
npm run dev

# Build
npm run build
npm run start

# Linting
npm run lint

# Database
npm run db:generate-types    # Regenerate TypeScript types
npm run db:migrate          # Push migrations to database
npm run db:reset            # Reset local database
```

## Stripe Integration (Scaffold)

The Stripe integration is scaffolded but not fully implemented:

1. Tenant model has `stripe_customer_id`, `stripe_subscription_id`, `stripe_subscription_status` fields
2. Webhook route at `/api/stripe/webhook` handles common events
3. To complete billing:
   - Implement checkout session creation
   - Handle subscription lifecycle in webhook
   - Add billing UI to admin dashboard

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Security Considerations

1. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the client
2. RLS policies are the primary security boundary
3. All tenant operations verify membership
4. Invite codes have expiry and usage limits
5. File uploads are scoped to tenant folders

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
