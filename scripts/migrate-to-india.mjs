/**
 * Supabase Region Migration Script
 * Copies all table data and storage files from the OLD project to the NEW project.
 *
 * Usage:
 *   OLD_URL=https://xxx.supabase.co \
 *   OLD_KEY=service_role_key_old \
 *   NEW_URL=https://yyy.supabase.co \
 *   NEW_KEY=service_role_key_new \
 *   node scripts/migrate-to-india.mjs
 *
 * Prerequisites:
 *   1. Create the new Supabase project in South Asia (Mumbai)
 *   2. Run supabase-migration.sql in the new project's SQL editor
 *   3. Run this script
 *   4. Log in to the new project, then run:
 *      UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
 */

import { createClient } from '@supabase/supabase-js';

// ── Config ──────────────────────────────────────────────────────────────────

const OLD_URL = process.env.OLD_URL;
const OLD_KEY = process.env.OLD_KEY;
const NEW_URL = process.env.NEW_URL;
const NEW_KEY = process.env.NEW_KEY;

if (!OLD_URL || !OLD_KEY || !NEW_URL || !NEW_KEY) {
  console.error(`
Missing environment variables. Run as:

  OLD_URL=https://xxx.supabase.co \\
  OLD_KEY=service_role_key_old \\
  NEW_URL=https://yyy.supabase.co \\
  NEW_KEY=service_role_key_new \\
  node scripts/migrate-to-india.mjs
`);
  process.exit(1);
}

const oldDb = createClient(OLD_URL, OLD_KEY, {
  auth: { persistSession: false },
});

const newDb = createClient(NEW_URL, NEW_KEY, {
  auth: { persistSession: false },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`  ${msg}`);
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function warn(msg) {
  console.warn(`  ⚠ ${msg}`);
}

async function fetchAll(client, table) {
  const { data, error } = await client.from(table).select('*').order('created_at');
  if (error) throw new Error(`Failed to read ${table}: ${error.message}`);
  return data ?? [];
}

async function insertBatch(client, table, rows) {
  if (rows.length === 0) return;
  // Insert in chunks of 500 to stay within request size limits
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await client.from(table).insert(chunk);
    if (error) throw new Error(`Failed to insert into ${table}: ${error.message}`);
  }
}

// ── Table migration ──────────────────────────────────────────────────────────

async function migrateTable(tableName, transformFn) {
  process.stdout.write(`\n  Migrating ${tableName}... `);
  const rows = await fetchAll(oldDb, tableName);

  if (rows.length === 0) {
    console.log('(empty, skipped)');
    return;
  }

  const transformed = transformFn ? rows.map(transformFn) : rows;
  await insertBatch(newDb, tableName, transformed);
  console.log(`${rows.length} rows copied`);
}

// ── Storage migration ────────────────────────────────────────────────────────

async function migrateStorage(bucket) {
  console.log(`\n  Migrating storage bucket: ${bucket}`);

  const { data: files, error } = await oldDb.storage.from(bucket).list('', {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    warn(`Could not list files in ${bucket}: ${error.message}`);
    return;
  }

  if (!files || files.length === 0) {
    log('No files found, skipped.');
    return;
  }

  let copied = 0;
  let failed = 0;

  for (const file of files) {
    // Skip folder placeholders
    if (file.id === null) continue;

    try {
      // Download from old project
      const { data: blob, error: dlErr } = await oldDb.storage
        .from(bucket)
        .download(file.name);

      if (dlErr || !blob) {
        warn(`  Could not download ${file.name}: ${dlErr?.message ?? 'unknown'}`);
        failed++;
        continue;
      }

      // Upload to new project
      const { error: ulErr } = await newDb.storage
        .from(bucket)
        .upload(file.name, blob, {
          contentType: file.metadata?.mimetype ?? 'application/octet-stream',
          upsert: true,
        });

      if (ulErr) {
        warn(`  Could not upload ${file.name}: ${ulErr.message}`);
        failed++;
        continue;
      }

      copied++;
      log(`  Copied ${file.name}`);
    } catch (e) {
      warn(`  Error processing ${file.name}: ${e.message}`);
      failed++;
    }
  }

  ok(`Storage: ${copied} files copied, ${failed} failed`);
}

// ── Verify connectivity ──────────────────────────────────────────────────────

async function verifyConnections() {
  console.log('\n  Verifying connections...');

  const { error: oldErr } = await oldDb.from('courses').select('id').limit(1);
  if (oldErr) throw new Error(`Cannot connect to OLD project: ${oldErr.message}`);
  ok('OLD project connected');

  const { error: newErr } = await newDb.from('courses').select('id').limit(1);
  if (newErr) throw new Error(`Cannot connect to NEW project: ${newErr.message}\n\n  Did you run supabase-migration.sql on the new project first?`);
  ok('NEW project connected');
}

// ── Check new project is empty ────────────────────────────────────────────────

async function checkNewProjectEmpty() {
  const { data } = await newDb.from('courses').select('id').limit(1);
  if (data && data.length > 0) {
    warn('NEW project already has data in the courses table.');
    warn('Re-running this script may cause duplicate key errors.');
    warn('If you want a clean migration, truncate the new project tables first.\n');
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' Supabase → India Region Migration');
  console.log(`  Old: ${OLD_URL}`);
  console.log(`  New: ${NEW_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await verifyConnections();
  await checkNewProjectEmpty();

  console.log('\n── Tables ───────────────────────────────');

  // Courses first (no foreign key deps)
  await migrateTable('courses');

  // Course videos depend on courses
  await migrateTable('course_videos');

  // Purchases — strip user_id (no auth users in new project yet)
  // access_token and email/phone are preserved for guest purchases
  await migrateTable('purchases', (row) => ({
    ...row,
    user_id: null, // auth users don't exist in new project; admin re-creates their account
  }));

  // Contact messages (standalone)
  await migrateTable('contact_messages');

  // NOTE: profiles table is NOT migrated — it's tied to auth.users UUIDs.
  // After you sign up in the new project, run:
  //   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';

  console.log('\n── Storage ──────────────────────────────');
  await migrateStorage('course-thumbnails');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' Migration complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`
Next steps:
  1. Update .env.local with new project credentials:
       NEXT_PUBLIC_SUPABASE_URL=${NEW_URL}
       NEXT_PUBLIC_SUPABASE_ANON_KEY=<new anon key>
       SUPABASE_SERVICE_ROLE_KEY=<new service role key>

  2. Update Vercel environment variables with the same new values.

  3. Log in to ${NEW_URL.replace('https://', 'https://supabase.com/dashboard/project/').split('.')[0]}
     and run in the SQL editor:
       UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';

  4. Add vercel.json with { "regions": ["bom1"] } if not already done.

  5. Verify the old project's thumbnail URLs still work — they point to the old
     Supabase storage URL. To fix, run this SQL on the new project after migration:
       UPDATE public.courses
       SET thumbnail_url = REPLACE(
         thumbnail_url,
         '${OLD_URL}/storage/v1/object/public/',
         '${NEW_URL}/storage/v1/object/public/'
       )
       WHERE thumbnail_url IS NOT NULL;
`);
}

main().catch((err) => {
  console.error('\n  FAILED:', err.message);
  process.exit(1);
});
