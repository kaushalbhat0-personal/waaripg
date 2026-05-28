#!/usr/bin/env node
// Environment validation script
// Run: node scripts/validate-env.cjs

const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const optionalVars = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_SENTRY_DSN",
];

const missing = [];
const warnings = [];
let valid = true;

for (const key of requiredVars) {
  const val = process.env[key];
  if (!val || val.includes("your-") || val === "placeholder-key") {
    missing.push(key);
    valid = false;
  }
}

for (const key of optionalVars) {
  const val = process.env[key];
  if (!val || val.includes("your-") || val === "placeholder-key") {
    warnings.push(key);
  }
}

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  missing.forEach((k) => console.error(`   - ${k}`));
}

if (warnings.length > 0) {
  console.warn("Unset or placeholder optional variables:");
  warnings.forEach((k) => console.warn(`   - ${k}`));
}

if (valid) {
  console.log("All required environment variables are set");
} else {
  process.exit(1);
}
