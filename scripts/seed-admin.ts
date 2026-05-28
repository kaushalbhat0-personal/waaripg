/**
 * Admin Seeder
 *
 * Usage:
 *   npm run seed:admin -- --email admin@example.com
 *
 * Assigns the admin role to a user by email.
 * Uses the service role key so it can bypass RLS.
 *
 * This script:
 *   - Looks up the user by email in auth.users
 *   - Calls assign_user_role_safe (idempotent)
 *   - Handles already-assigned and not-found gracefully
 *   - Exits with a non-zero code on failure
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getEmailFromArgs(): string | null {
  const idx = process.argv.indexOf("--email");
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return null;
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    process.exit(1);
  }

  const email = getEmailFromArgs();
  if (!email) {
    console.error("❌ Usage: npm run seed:admin -- --email <user@example.com>");
    process.exit(1);
  }

  console.log(`🔍 Looking up user: ${email}`);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Lookup user by email in auth.users via admin API
  const { data: users, error: lookupError } = await supabase.auth.admin.listUsers();

  if (lookupError) {
    console.error(`❌ Failed to list users: ${lookupError.message}`);
    process.exit(1);
  }

  const user = users.users.find((u) => u.email === email);

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    console.error("   Make sure the user exists in Supabase Auth (Dashboard → Authentication → Users)");
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.id} (${user.email})`);

  // Call assign_user_role_safe via service_role
  const { data, error } = await supabase.rpc("assign_user_role_safe", {
    p_user_id: user.id,
    p_role_name: "admin",
    p_organization_id: null,
    p_assigned_by: null,
  });

  const result = data as {
    success: boolean;
    data?: { id: string; already_exists: boolean };
    error?: string;
  } | null;

  if (error || !result?.success) {
    console.error(`❌ Role assignment failed: ${error?.message ?? result?.error ?? "Unknown error"}`);
    process.exit(1);
  }

  if (result.data?.already_exists) {
    console.log(`ℹ️  User ${email} already has the admin role (id: ${result.data.id})`);
  } else {
    console.log(`✅ Admin role assigned to ${email} (id: ${result.data?.id})`);
  }

  process.exit(0);
}

main();
