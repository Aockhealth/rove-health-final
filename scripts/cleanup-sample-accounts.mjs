// Deletes every auth user whose email ends in @rovehealth-sample.internal.
// Cascade-delete migrations (20260726150000_full_cascade_delete_auth_users.sql,
// 20260824010000_cascade_delete_ttc_tables.sql) mean deleting the auth user
// removes every dependent row (profiles, user_onboarding, daily_logs, etc.)
// automatically.
//
// Usage: node scripts/cleanup-sample-accounts.mjs [--yes]
// Without --yes, does a dry run and only lists what would be deleted.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SAMPLE_EMAIL_DOMAIN = 'rovehealth-sample.internal';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listSampleUsers() {
  const matches = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    matches.push(...data.users.filter((u) => u.email?.endsWith(`@${SAMPLE_EMAIL_DOMAIN}`)));
    if (data.users.length < 1000) break;
    page++;
  }
  return matches;
}

async function main() {
  const confirm = process.argv.includes('--yes');
  const users = await listSampleUsers();

  if (!users.length) {
    console.log(`No accounts found with @${SAMPLE_EMAIL_DOMAIN}.`);
    return;
  }

  console.log(`Found ${users.length} sample account(s):`);
  for (const u of users) console.log(`  - ${u.email} (${u.id})`);

  if (!confirm) {
    console.log('\nDry run only — re-run with --yes to actually delete these accounts.');
    return;
  }

  for (const u of users) {
    const { error } = await supabase.auth.admin.deleteUser(u.id);
    if (error) console.error(`  [FAIL] ${u.email}: ${error.message}`);
    else console.log(`  [deleted] ${u.email}`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
