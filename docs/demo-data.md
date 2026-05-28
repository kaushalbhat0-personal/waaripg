# Demo Data Guide

## Overview

The seed script at `scripts/seed/seed.ts` generates realistic multi-tenant demo data for development, testing, and client demos.

## Usage

### Prerequisites
- Supabase migrations must be applied
- `.env.local` must have `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set (uses service_role for direct DB access)

### Run Seed
```bash
npm run seed
```

This creates:

| Entity | Count | Details |
|---|---|---|
| Organizations | 3 | Sunrise PG, Green Valley, Lake View |
| Properties | 5 | Mix of PG and hostels |
| Floors | ~20 | Based on room counts |
| Rooms | ~100+ | Mix of single/double/triple/dormitory |
| Beds | ~200+ | Based on room capacities |
| Residents | 20-30 | Indian names, varied occupations |
| Allocations | 20-30 | Tied to occupied beds |
| Invoices | 60-120 | 1-4 per resident, varied statuses |
| Payments | 40-80 | Cash/UPI/Card/Bank Transfer |
| Gate Logs | 100-300 | Entry/exit with timestamps |
| Violations | 10-20 | Open and resolved |
| Notifications | 15 | Various types |
| Activity Logs | 20 | Recent actions |

## Data Characteristics

### Organizations
- 3 separate organizations with different slugs
- Each has 1-2 properties

### Residents
- Realistic Indian first and last names
- Occupations: Software Engineer, Data Analyst, MBA Student, etc.
- Government ID proofs (Aadhar/PAN)
- Emergency contacts included

### Financial Data
- Rent amounts range from ₹3,500 to ₹10,000
- Payment methods: cash, UPI, card, bank_transfer
- Invoice statuses: paid, pending, overdue, cancelled
- Transaction IDs in realistic format (TXN12345678)

### Gate Logs
- Realistic timestamps spread across recent months
- Mix of entry and exit events
- Some verified by security staff

### Violations
- Types: late_return, unauthorized_guest, noise_complaint, damage_property, rule_violation
- ~40% resolved with notes, ~60% open

## Idempotency

The seed script is **idempotent** — running it multiple times will:
1. Clean all existing data (delete in FK-safe order)
2. Re-insert fresh data
3. Generate different random data each time

## Customization

To customize seed data:
1. Edit `scripts/seed/seed.ts`
2. Modify arrays (names, occupations, rent ranges)
3. Adjust counts (residents, invoices per resident)
4. Run `npm run seed` again

## Troubleshooting

### "Relation does not exist"
→ Run migrations first: `npx supabase migration up`

### "Permission denied"
→ Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

### "Database connection failed"
→ Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
