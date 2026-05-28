# Production Readiness Checklist

## Pre-Deployment

### Security
- [ ] All API routes authenticated with Supabase session
- [ ] RLS policies enabled on all tables
- [ ] Environment variables validated at runtime
- [ ] Security headers configured (XSS, CSP, HSTS, etc.)
- [ ] Rate limiting active on public endpoints
- [ ] No hardcoded secrets in codebase
- [ ] `.env.example` does not contain real credentials
- [ ] CORS configured for API routes

### Database
- [ ] All migrations run on production database
- [ ] Performance indexes in place (migration 00006 + 00007)
- [ ] `check_database_health()` function available
- [ ] Point-in-Time Recovery enabled (Supabase Pro)
- [ ] Database backups configured (daily minimum)
- [ ] Connection pooling enabled for production load

### Monitoring
- [ ] Health check endpoint (`/api/health`) responds correctly
- [ ] Sentry DSN configured for error tracking
- [ ] Structured logging active (no console.log in production)
- [ ] Uptime monitoring configured (external service)

### Application
- [ ] `npm run build` passes with 0 errors
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run typecheck` passes with 0 errors
- [ ] All server actions use Zod `safeParse()` for validation
- [ ] Error boundaries in place for client components
- [ ] Loading states/skeletons for all data-fetching pages
- [ ] Empty states handled for all lists/views
- [ ] Mobile responsive layout verified

### Performance
- [ ] Image optimization configured in `next.config.ts`
- [ ] Package imports optimized (`optimizePackageImports`)
- [ ] No N+1 queries in critical paths
- [ ] React Strict Mode enabled
- [ ] Production console logs stripped

## Deployment Steps

- [ ] Push latest code to production branch
- [ ] Set environment variables in Vercel
- [ ] Deploy via Vercel dashboard or CLI
- [ ] Verify `/api/health` returns `healthy`
- [ ] Run smoke tests: login, dashboard, key pages
- [ ] Verify Sentry is receiving events
- [ ] Monitor Vercel logs for errors (first 24 hours)

## Post-Deployment

- [ ] Test user registration/login flow
- [ ] Verify tenant isolation works correctly
- [ ] Test gate log entry/exit flow
- [ ] Verify payment/invoice creation flow
- [ ] Test attendance generation
- [ ] Verify notification delivery
- [ ] Check mobile responsiveness
- [ ] Review error rates first 24 hours
- [ ] Monitor database connection pool usage
