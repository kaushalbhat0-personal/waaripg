# Backup & Recovery Guide

## Automated Backups (Supabase Pro)

Supabase Pro plan includes:
- Daily backups with 7-day retention
- Point-in-Time Recovery (PITR) with 2-day window
- Automatic backup storage

### Enable PITR
1. Go to Supabase Dashboard → Database → Backups
2. Enable Point-in-Time Recovery
3. Select retention period (minimum 2 days recommended)

## Manual Backup

### Database Schema & Data
```bash
# Backup entire database
npx supabase db dump -f backups/waaripg-$(date +%Y%m%d).sql

# Backup specific schema only (no data)
npx supabase db dump --schema-only -f backups/schema.sql
```

### Environment Variables
Keep a secure copy of all environment variables:
```bash
# Export current env vars (run locally)
cp .env.local backups/env-$(date +%Y%m%d).backup
```

## Recovery Procedures

### Database Restore (from backup file)
```bash
# Restore to a fresh Supabase project
npx supabase db restore backups/waaripg-20250101.sql --db-url <new-db-url>
```

### Point-in-Time Recovery
1. Go to Supabase Dashboard → Database → Backups
2. Click "Restore" and select target time
3. This creates a new database instance at the chosen point
4. Update `NEXT_PUBLIC_SUPABASE_URL` to point to the restored instance

### Rollback Code Deployment
1. Go to Vercel Dashboard → Deployments
2. Find the last known good deployment
3. Click "..." → "Promote to Production"

## Disaster Recovery Plan

### Scenario: Database Corruption
1. Stop all write operations (maintenance mode)
2. Restore from latest backup to new database instance
3. Update environment variables to point to new database
4. Redeploy application
5. Verify data integrity

### Scenario: Full Application Failure
1. Check Vercel status (status.vercel.com)
2. Check Supabase status (status.supabase.com)
3. If platform issue, wait for resolution
4. If application issue, rollback to previous deployment
5. If data issue, restore from backup

### Scenario: Security Breach
1. Revoke all API keys immediately
2. Rotate Supabase anon key and service role key
3. Force all users to re-authenticate
4. Review audit logs for suspicious activity
5. Restore from pre-breach backup if necessary
6. File security report with Supabase

## Recovery Testing

Schedule quarterly recovery drills:
1. Create a new Supabase project (staging)
2. Restore latest backup into it
3. Deploy application pointed to restored database
4. Verify all features work correctly
5. Document recovery time and issues
