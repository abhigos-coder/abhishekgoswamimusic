# Migration Guide — Abhishek Goswami Music

Steps to migrate the project to a new Supabase organization and Vercel account.

---

## 1. Supabase Setup (New Project)

Create a new Supabase project, then run the SQL migrations **in order** in the SQL Editor:

### Step 1 — Main schema

Open `supabase-migration.sql` and run the entire file. This creates:

- `profiles` table (with auto-create trigger on signup)
- `courses` table
- `course_videos` table
- `purchases` table
- `contact_messages` table
- `update_updated_at()` trigger function
- All RLS policies
- `course-thumbnails` storage bucket with policies

### Step 2 — Site settings

Open `supabase-migration-site-settings.sql` and run it. This creates:

- `site_settings` table (About page image + bio)
- Seeds one row with NULL values
- RLS policies

### Step 3 — Promote admin

After signing up on the new app for the first time, run:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 2. Vercel Setup (New Account)

### Project settings

- **Framework**: Next.js (auto-detected)
- **Region**: `bom1` (Mumbai) — set via `vercel.json`, no manual config needed
- **Build command**: default (`next build`)

### Environment variables

Add all of these in **Vercel > Project Settings > Environment Variables** for Production, Preview, and Development:

| Variable | Type | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | New Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | New Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | New Supabase service role key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public | Razorpay key (use live key for production) |
| `RAZORPAY_KEY_SECRET` | Secret | Razorpay secret |
| `GMAIL_USER` | Secret | Gmail address for contact form emails |
| `GMAIL_APP_PASSWORD` | Secret | Gmail app password |
| `NEXT_PUBLIC_APP_URL` | Public | Production URL (e.g. `https://yourdomain.com`) |

### Domain

1. Add your custom domain in **Vercel > Settings > Domains**
2. Update DNS records to point to the new Vercel project
3. Update `NEXT_PUBLIC_APP_URL` to match

---

## 3. Connect Git

Link the GitHub repository to the new Vercel project. Pushes to `main` will auto-deploy.

---

## 4. Create Admin Account

The app uses Supabase Auth. When a user signs up, a `profiles` row is auto-created via a database trigger. To set up the admin account on the new project:

### Step 1 — Register

Go to your deployed site and sign up at `/register` with the admin email address.

> Example: Register with `abgo4u@gmail.com`

### Step 2 — Promote to admin

Open the **Supabase Dashboard > SQL Editor** and run:

```sql
-- Replace with your actual admin email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'abgo4u@gmail.com';
```

### Step 3 — Verify

1. Go to `/admin/login` and log in
2. You should see the admin dashboard with sidebar links (Dashboard, Courses, Payments, Messages, Settings)

> **Multiple admins:** Repeat Steps 1-2 for each person who needs admin access.

---

## 5. Data Migration (if not a fresh start)

Skip this section if starting fresh with no existing data.

### Step 1 — Export app data from old project

Connect to the old Supabase database via the connection string (found in **Supabase > Settings > Database**).

Only export app data tables — **not** `profiles` or `auth.users` (admins will re-register on the new project).

```bash
OLD_DB="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

pg_dump "$OLD_DB" \
  --data-only \
  --table=public.courses \
  --table=public.course_videos \
  --table=public.purchases \
  --table=public.contact_messages \
  --table=public.site_settings \
  > data-export.sql
```

### Step 2 — Import into new project

```bash
NEW_DB="postgresql://postgres.[NEW_PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

psql "$NEW_DB" < data-export.sql
```

### Step 3 — Reconnect purchases to new admin (if needed)

Old purchases may reference `user_id` from the old project's auth users. Since this app uses guest checkout (`user_id` is NULL for guest purchases), most records will import fine. If any purchases were made by a logged-in admin for testing, clear the stale references:

```sql
-- Clear user_id references that point to old auth users (no longer valid)
UPDATE public.purchases
SET user_id = NULL
WHERE user_id IS NOT NULL;
```

### Step 4 — Storage files

1. Download all files from the old project's `course-thumbnails` bucket (Supabase Dashboard > Storage)
2. Upload them to the new project's `course-thumbnails` bucket
3. Update stored image URLs to point to the new Supabase project:

```sql
-- Update course thumbnail URLs
UPDATE public.courses
SET thumbnail_url = REPLACE(thumbnail_url, 'OLD_PROJECT_REF', 'NEW_PROJECT_REF')
WHERE thumbnail_url IS NOT NULL;

-- Update about page image URL
UPDATE public.site_settings
SET about_image_url = REPLACE(about_image_url, 'OLD_PROJECT_REF', 'NEW_PROJECT_REF')
WHERE about_image_url IS NOT NULL;
```

> Replace `OLD_PROJECT_REF` and `NEW_PROJECT_REF` with the actual Supabase project reference IDs (the subdomain part of your Supabase URL, e.g. `bklbtfgmqzzvcpoihgvb`).

---

## 6. Post-Migration Checklist

- [ ] Both SQL migrations ran without errors (`supabase-migration.sql` then `supabase-migration-site-settings.sql`)
- [ ] Admin registered and promoted (`role = 'admin'`)
- [ ] App data imported (if migrating existing data)
- [ ] Storage files moved and image URLs updated
- [ ] All Vercel environment variables set
- [ ] Custom domain configured and DNS propagated
- [ ] `NEXT_PUBLIC_APP_URL` matches the production domain
- [ ] Razorpay switched from test keys (`rzp_test_...`) to live keys
- [ ] Admin panel accessible at `/admin`
- [ ] Course pages load correctly
- [ ] Payment flow works end-to-end
- [ ] Contact form sends emails
- [ ] About page loads image and bio from settings
