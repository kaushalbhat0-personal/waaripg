# Environment Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 20+ (check with `node --version`)
- npm 10+ (check with `npm --version`)
- Git

### 2. Clone & Install
```bash
git clone <repo-url>
cd waaripg
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

**Required variables:**
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL (from Supabase Dashboard → Settings → API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Your Supabase service_role key (keep secret!)

### 4. Database Setup
```bash
# Install Supabase CLI (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref <your-project-ref>

# Run migrations
npx supabase migration up

# Generate types
npm run db:types
```

### 5. Seed Data (Optional)
```bash
npm run seed
```

### 6. Start Development
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Environment Files

| File | Purpose | Committed? |
|---|---|---|
| `.env.example` | Template with all configurable vars | Yes |
| `.env.local` | Local development secrets | No |
| `.env.production` | Production overrides | No |
| `.env.test` | Test environment | No |

## Supabase Setup

### Project Creation
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a strong database password (save it securely)
3. Wait for database provisioning (2-5 minutes)

### Authentication Setup
1. Go to Authentication → Settings
2. Enable email/password sign-up
3. (Optional) Configure OAuth providers (Google, GitHub)
4. Configure Custom SMTP for production (Resend, SendGrid, etc.)

### Storage Setup
1. Go to Storage → Create a new bucket (e.g., `public`)
2. Set bucket to public (if residents need to upload photos)
3. Configure CORS if needed

## Verification

After setup, verify everything works:
1. Visit http://localhost:3000
2. You should see the login page
3. Create an account and sign in
4. You should be redirected to the dashboard

## Troubleshooting

### "Supabase URL is not configured"
→ Ensure `NEXT_PUBLIC_SUPABASE_URL` is set in `.env.local`

### "Failed to run migrations"
→ Ensure Supabase CLI is logged in and linked to correct project

### Login not working
→ Check Supabase Authentication settings → ensure email/password is enabled

### TypeScript errors after setup
→ Run `npm run db:types` to regenerate types
