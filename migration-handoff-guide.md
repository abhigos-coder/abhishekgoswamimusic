# Migration Handoff Guide — Abhishek Goswami Music

**Date:** April 29, 2026
**Project:** Abhishek Goswami Music — Course Selling Platform
**Stack:** Next.js 16, Supabase, Razorpay, Gmail SMTP, Vercel

---

## 1. Project Overview

A Next.js 16 course-selling platform where users can browse and purchase music courses. Course content is delivered via embedded YouTube videos. The platform includes:

- **Public site** — Course listings, purchase flow, video playback
- **Admin panel** — Course management, video management, contact messages, payment records
- **Guest checkout** — Buyers don't need an account; access is tied to email + access token
- **Access recovery** — Email-based recovery flow for returning buyers

---

## 2. Technology Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| Framework | Next.js 16.2.4 | App Router, TypeScript, Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) | 5 tables with Row Level Security |
| Auth | Supabase Auth | Admin login + session management |
| Storage | Supabase Storage | `course-thumbnails` bucket (public) |
| Payments | Razorpay | Order creation + HMAC signature verification |
| Email | Nodemailer + Gmail SMTP | Contact notifications, access recovery |
| Hosting | Vercel | Mumbai region (bom1) |
| Videos | YouTube | Unlisted videos embedded via iframe |

---

## 3. What Changes vs. What Stays

| Service | Change Needed? | Details |
|---------|---------------|---------|
| **Razorpay** | No change | Same account and keys — reuse as-is |
| **Gmail SMTP** | No change | Same Gmail credentials — reuse as-is |
| **Domain** | No change | Same domain — just re-point to new team's Vercel |
| **Supabase** | New project needed | Migrate database + storage to new team's Supabase |
| **Vercel** | New project needed | Deploy to new team's Vercel account |

---

## 4. Supabase Migration (Main Effort)

**Current project URL:** Hosted on Supabase cloud.

**Action needed:**

1. Create a new Supabase project under the new team's account
2. Run `supabase-migration.sql` (included in the repository root) to create the full schema with:
   - All 5 tables
   - Row Level Security (RLS) policies
   - Indexes
   - Triggers (auto-update timestamps, auto-create profile on signup)
3. Export existing data from the current project:
   - Use `pg_dump` via Supabase dashboard or CLI
   - Or export tables as CSV from the Supabase Table Editor
4. Import data into the new project
5. Recreate the `course-thumbnails` storage bucket (set to **public**)
6. Download all existing thumbnails and re-upload to the new bucket
7. Update Supabase environment variables to point to the new project

**Database Tables:**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User accounts & roles | id, email, role (user/admin) |
| `courses` | Course listings | title, slug, price (paise), thumbnail_url, is_published |
| `course_videos` | Lesson videos | course_id, title, youtube_url, sort_order, is_preview |
| `purchases` | Payment records | email, course_id, razorpay_payment_id, status, access_token |
| `contact_messages` | Contact form submissions | name, email, message, is_read |

---

## 5. Vercel & Domain Transfer

This is the key infrastructure change. The domain stays the same — it just needs to point to the new team's Vercel project.

### Step-by-step: Transfer to New Team's Vercel

1. **New team** creates a Vercel account and imports the Git repository
2. **New team** sets all environment variables in their Vercel project dashboard (see Section 6)
3. **New team** adds the domain in their Vercel project: **Project Settings > Domains > Add**
4. Vercel will provide DNS records (typically an A record or CNAME)
5. **Current owner** removes the domain from the old Vercel project: **Project Settings > Domains > Remove**
6. **Current owner** updates DNS records at the domain registrar to point to the new team's Vercel:
   - If using Vercel DNS: Transfer the domain to the new team's Vercel account via **Settings > Domains > Transfer**
   - If using an external registrar (GoDaddy, Namecheap, Cloudflare, etc.): Update the DNS records to the values provided by the new team's Vercel project
7. Wait for DNS propagation (usually minutes, can take up to 48 hours)
8. Verify the site loads on the new deployment
9. **Current owner** deletes the old Vercel project

**Note:** To avoid downtime, coordinate steps 5-6 together. Remove from old project and update DNS in quick succession, or have the new team's Vercel project ready first.

### Alternative: Transfer Vercel Project Directly

If both parties are on Vercel Pro/Enterprise, Vercel supports direct project transfers:
- Go to **Project Settings > General > Transfer Project**
- Enter the new team's Vercel account
- This transfers the project, environment variables, and domain configuration in one step

---

## 6. Environment Variables

The new team must configure these in their Vercel dashboard (**Project Settings > Environment Variables**):

```
# Supabase (from their NEW Supabase project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Razorpay (NO CHANGE — same keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=<provide current key>
RAZORPAY_KEY_SECRET=<provide current secret>

# Gmail SMTP (NO CHANGE — same credentials)
GMAIL_USER=<provide current email>
GMAIL_APP_PASSWORD=<provide current app password>

# Application URL (NO CHANGE — same domain)
NEXT_PUBLIC_APP_URL=https://<current-domain>
```

**Important:** Only the three Supabase variables change. Razorpay, Gmail, and App URL stay the same. Share the Razorpay and Gmail credentials securely with the new team (use a password manager or encrypted channel).

---

## 7. Key Files Reference

| File | Purpose |
|------|---------|
| `supabase-migration.sql` | Full database schema, RLS policies, indexes, triggers |
| `src/lib/supabase/admin.ts` | Service-role Supabase client (bypasses RLS) |
| `src/lib/supabase/server.ts` | Server-side Supabase client with SSR cookie handling |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/razorpay.ts` | Razorpay SDK initialization |
| `src/proxy.ts` | Middleware — CSRF protection + admin route auth |
| `next.config.ts` | CSP headers, security headers, image remote patterns |
| `vercel.json` | Deployment region configuration (Mumbai) |
| `src/types/database.ts` | TypeScript interfaces for all database tables |
| `src/lib/constants.ts` | Site name, tagline, description |

---

## 8. Security Configuration

The following security measures are configured in `next.config.ts` and `src/proxy.ts`:

- **Content Security Policy (CSP)** — Restricts script, style, image, and frame sources
- **CSRF Protection** — Blocks cross-origin mutations to `/api/*`
- **Security Headers** — X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy
- **Admin Auth Middleware** — Verifies admin role before allowing access to `/admin/*`

No changes needed here since the domain remains the same.

---

## 9. Razorpay Details (No Change)

The Razorpay integration stays as-is. For reference:

- **Integration type:** Razorpay Checkout.js with server-side order creation
- **Signature verification:** HMAC-SHA256
- **Endpoints:**
  - `POST /api/razorpay/create-order` — Creates a Razorpay order
  - `POST /api/razorpay/verify` — Verifies payment signature and activates access
- **Current mode:** Test keys (`rzp_test_*`) — switch to live keys when going to production

---

## 10. Gmail SMTP Details (No Change)

The email setup stays as-is. For reference:

- **Library:** Nodemailer with Gmail SMTP
- **Used for:**
  - Contact form notifications (sent to admin inbox)
  - Course access recovery links (sent to buyers)
- **Note:** If email volume grows significantly, consider upgrading to a transactional email service (Resend, SendGrid, AWS SES) for better deliverability and rate limits

---

## 11. Deployment Steps for New Team

1. Clone the Git repository
2. Run `npm install`
3. Create a new Supabase project and run `supabase-migration.sql`
4. Import existing data (all 5 tables + storage bucket thumbnails)
5. Create a new Vercel project, import the repo, set environment variables
6. Add the domain to the new Vercel project
7. Coordinate with current owner to update DNS records
8. Verify: admin login, course display, payment flow, contact form, access recovery
9. Confirm handoff complete

---

## 12. Post-Handoff Cleanup (For Current Owner)

Once the new team confirms everything works:

1. **Delete** old Vercel project
2. **Delete** old Supabase project (revokes all keys automatically)
3. **Remove** local `.env.local` files and any stored credentials
4. **Optionally** change Gmail app password if you want to revoke the shared credential later

**Note:** Since Razorpay and Gmail credentials are shared with the new team, coordinate before revoking anything.

---

## 13. Handoff Checklist

- [ ] Git repository shared with new team
- [ ] `supabase-migration.sql` reviewed and understood by new team
- [ ] Supabase data exported (all 5 tables + storage bucket thumbnails)
- [ ] New Supabase project created and data imported
- [ ] Razorpay credentials shared securely with new team
- [ ] Gmail SMTP credentials shared securely with new team
- [ ] New Vercel project created with all environment variables
- [ ] Domain added to new Vercel project
- [ ] DNS records updated to point to new Vercel
- [ ] Site verified on new deployment (admin, payments, emails, videos)
- [ ] Old Vercel project deleted
- [ ] Old Supabase project deleted

---

*This document contains sensitive infrastructure details. Share securely and delete after migration is complete.*
