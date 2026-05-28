# Deployment Guide

## Prerequisites
- Node.js 20+
- Supabase project (linked via `npx supabase link`)
- Vercel account (for hosting)
- Sentry account (optional, for error monitoring)
- Custom domain (optional)

## Environment Setup

### 1. Clone & Install
```bash
git clone <repo-url>
cd waaripg
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and fill in required values:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin operations) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the app |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error tracking |

### 3. Database Setup
```bash
# Link to Supabase project
npx supabase link --project-ref <project-ref>

# Run all migrations
npx supabase migration up

# Generate TypeScript types (optional but recommended)
npm run db:types
```

### 4. Seed Demo Data (Optional)
```bash
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub/GitLab
2. Import project in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Deploy

### Environment Variables (Vercel)
Set these in Vercel project settings → Environment Variables:

**Production:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://your-domain.com`
- `NEXT_PUBLIC_APP_NAME` → `WaaRi PG`
- `NEXT_PUBLIC_SENTRY_DSN` (optional)
- `SENTRY_AUTH_TOKEN` (optional, for source maps)

**Preview/Staging:**
- Same as production, but `NEXT_PUBLIC_APP_URL` → preview URL

### Supabase Production Checklist

1. **Enable Row Level Security (RLS)** on all tables
2. **Set up database backups** (Supabase Pro → Point-in-Time Recovery)
3. **Enable SSL enforcement** in Supabase dashboard
4. **Configure authentication providers** (email/password at minimum)
5. **Set up custom SMTP** for password reset emails
6. **Review SQL migration policies** — ensure no insecure defaults

## Post-Deployment Verification

- [ ] Visit `/api/health` — should return `{"status":"healthy"}`
- [ ] Login flow works end-to-end
- [ ] Dashboard loads with data
- [ ] Gate logs, violations, payments pages render correctly
- [ ] Mobile responsive layout renders properly
- [ ] Cmd+K command palette works

## Rollback Strategy

1. **Code rollback**: Revert to previous deployment in Vercel dashboard
2. **Database rollback**: Use `npx supabase migration down` (if reversible) or restore from backup
3. **Data recovery**: Point-in-Time Recovery via Supabase (Pro plan required)

## Monitoring

- **Health checks**: `/api/health` endpoint (use UptimeRobot, Better Uptime, etc.)
- **Error tracking**: Sentry dashboard (if configured)
- **Performance**: Vercel Analytics, Supabase Query Performance
- **Logs**: Vercel Logs, Supabase Logs
