# Abhishek Goswami Music — User Manual

## What This Site Offers

### For Visitors (Public)
- **Home** — Landing page showcasing all published courses in a grid
- **About** — Artist bio, teaching approach, social links, and contact form
- **Course Detail** — Each course page shows description, full curriculum outline with lesson durations, price, and preview videos
- **Preview Videos** — Watch selected free preview lessons directly on the course page (no account needed)
- **Day/Night Theme** — Toggle between dark (warm amber) and light modes

### For Buyers (No Account Required)
- **Guest Checkout** — Enter email + phone, pay via Razorpay (UPI, cards, netbanking) — no signup needed
- **Course Player** — Watch sequential video lessons with a sidebar playlist
- **Lifetime Access** — Purchase is stored permanently; access via browser cookie (1 year)
- **Recover Access** — Lost your cookies? Enter your purchase email at `/recover-access` to get a magic link that restores access on any device/browser

### For Admin (Musician)
- **Admin Panel** (`/admin`) — Manage the entire site (protected by Supabase auth)
- **Dashboard** — See total courses, students (by unique email), revenue, and unread messages at a glance
- **Courses CRUD** — Create, edit, publish/unpublish, and delete courses
- **Video Management** — Add YouTube unlisted URLs per course, set preview videos, reorder lessons, live preview before saving
- **Payments** — View all transactions (buyer email, course, amount, status, Razorpay payment ID)
- **Messages** — Read, mark as read/unread, and delete contact form submissions

---

## How the Purchase Flow Works

### Step-by-step: What a buyer experiences

```
Visitor browses courses on the home page
    ↓
Clicks a course → sees description, curriculum, price, preview videos
    ↓
Clicks "Buy Now — ₹999"
    ↓
Guest Checkout modal opens → enters email + phone
    ↓
Clicks "Continue to Payment" → Razorpay checkout opens (UPI / Card / Netbanking)
    ↓
Payment completes → Razorpay signature verified on server
    ↓
httpOnly cookie set for this course → redirected to success page
    ↓
Clicks "Start Watching" → full course player with all lessons
    ↓
Can rewatch anytime — lifetime access (cookie valid for 1 year)
```

### Key design choice: No accounts

Buyers do **not** need to create an account. They provide email + phone during checkout (for purchase records and support), pay, and immediately get access. Access is tied to an httpOnly browser cookie.

**Trade-off:** If a buyer clears cookies, switches browsers, or uses a new device, they lose access. This is solved by the **Recover Access** flow (see below).

---

## How Content Protection Works

Premium course videos are YouTube **unlisted** links. The site prevents non-paying users from accessing these links through **2 layers of protection**:

**Layer 1 — Cookie Validation**
When someone visits `/courses/guitar-basics/watch`, the server component reads the `purchase_access_{courseId}` cookie from the browser. If the cookie is missing, the user is redirected to the course detail page (where they see the "Buy Now" button). They never reach the player.

**Layer 2 — Server-Side Database Verification**
Even if a cookie exists, the server validates its value (`access_token` UUID) against the `purchases` table, checking that a completed purchase exists with that token for that course. Only if verification passes does the server fetch and render the YouTube URLs into the page. A guessed or forged cookie value will fail this check.

### What Razorpay Does

Razorpay handles the actual money transaction:

1. User clicks **"Buy Now"** → the server creates a Razorpay order
2. Razorpay checkout modal opens → user pays via UPI / card / netbanking
3. After payment, Razorpay sends back a **payment ID + cryptographic signature**
4. The server **verifies the signature** using HMAC-SHA256 with your secret key
5. Only if the signature is valid → the purchase is marked as "completed" in the database
6. An httpOnly cookie is set → the user can now access the course videos

**Key security point:** The signature verification (step 4) ensures that no one can fake a payment. Only Razorpay can produce a valid signature, and only your server has the secret key to verify it.

### What Users See

| User State | Course Detail Page | Course Player |
|---|---|---|
| No purchase cookie | Curriculum titles + lock icons, "Buy Now" button, preview videos | Redirected to course detail |
| Valid purchase cookie | Curriculum + play icons, "Continue Watching" button | Full video player with all lessons |

### Limitations (MVP Trade-offs)

- YouTube unlisted URLs appear in the page HTML source for users who have purchased. A technically savvy user could extract and share them. This is acceptable for MVP because:
  - The URLs are only rendered for verified purchasers
  - YouTube unlisted is "security through obscurity" by design
  - For stronger protection in the future, consider Vimeo's domain-restricted embeds or a custom video player with token-based access

---

## How to Recover Access

If a buyer clears their browser cookies, switches to a new browser, or uses a different device, they can restore access without contacting support:

1. Visit `/recover-access` (or click "Already purchased? Recover access" on any course page)
2. Enter the email used during purchase
3. Receive a magic link via email (expires in 30 minutes)
4. Click the link → all purchase cookies are restored on the current browser
5. See the "Access Restored!" confirmation page

**How it works under the hood:**
- The server generates a signed HMAC token encoding `email + timestamp` (no database changes needed)
- When the link is clicked, the server verifies the token's signature and checks it hasn't expired
- It queries all completed purchases for that email and sets a `purchase_access_{courseId}` cookie for each one
- The magic link is single-session — once the cookies are set, the buyer has access again

---

## How to Upload a Paid Course (Step-by-Step Workflow)

The site does not host any video files. All videos live on YouTube as **unlisted** uploads. You simply paste the YouTube URLs into the admin panel. Here's the full workflow:

### Step 1: Record & Upload to YouTube

1. Record your course lessons (e.g., "Lesson 1 — Jazz Chord Voicings", "Lesson 2 — Walking Bass Lines")
2. Upload each lesson to your YouTube channel
3. **Set each video to "Unlisted"** — this is critical
   - Go to YouTube Studio → Content → click the video → Visibility → **Unlisted**
   - Unlisted means: anyone with the direct link can watch, but it won't appear in search, on your channel page, or in recommendations
   - Only people who buy the course on your site will ever get these links
4. Copy the URL of each uploaded video (e.g., `https://www.youtube.com/watch?v=abc123`)

### Step 2: Create the Course in Admin Panel

1. Log in to your site and go to `/admin`
2. Click **Courses** in the sidebar → **New Course**
3. Fill in:
   - **Title** — e.g., "Jazz Chord Melody Masterclass"
   - **Slug** — auto-generates from title, or type your own (e.g., `jazz-chord-melody`)
   - **Description** — what students will learn, who it's for, etc.
   - **Price** — in Rupees (e.g., `999` for ₹999)
   - **Thumbnail URL** — optional, paste a link to a course cover image
   - **Published** — leave unchecked while you're still adding videos
4. Click **Create Course**

### Step 3: Add Videos to the Course

1. From the Courses list, click the **video icon** next to your course
2. Click **Add Video** — a form appears with a **live YouTube preview**
3. Paste the YouTube URL — the video loads immediately so you can verify it's correct
4. Fill in title, duration (optional), and check **Free Preview** if you want this lesson to be watchable for free as a teaser on the course page
5. Repeat for all lessons. Videos are numbered in the order you add them
6. The first few videos should ideally be marked as "Preview" to give potential buyers a taste

### Step 4: Publish the Course

1. Go back to **Courses** → click the **edit icon** next to your course
2. Check the **Published** checkbox
3. Click **Update Course**
4. The course now appears on the home page with the "Buy Now" button

### Step 5: Monitor Payments

- Go to `/admin` → **Payments** to see all transactions
- Each row shows: date, buyer email, course, amount, status, and Razorpay payment ID
- You can cross-reference with your Razorpay dashboard for refunds or disputes

### Quick Reference: YouTube Upload Settings

| Setting | Value | Why |
|---|---|---|
| Visibility | **Unlisted** | Only accessible via direct link — your site controls who gets the link |
| Comments | Off (recommended) | Prevents the URL from being discovered via comment notifications |
| Embedding | Allowed | Required for the site's video player to work |
| Age restriction | None | Unless content requires it |
| Playlist | Don't add to any public playlist | Public playlists expose unlisted video URLs |

### Adding More Lessons Later

You can add new videos to an existing published course at any time:
1. Upload the new lesson to YouTube (unlisted)
2. Go to Admin → Courses → video icon → Add Video
3. Buyers who already purchased will see the new lesson immediately

### Updating or Replacing a Video

If you need to re-record a lesson:
1. Upload the new version to YouTube (unlisted)
2. Delete the old video entry in Admin → add a new one with the new URL
3. Optionally delete the old YouTube upload

---

## Setup Checklist

1. Create a **Supabase** project → copy URL + anon key + service role key
2. Run `supabase-migration.sql` in Supabase SQL Editor
3. Create a **Razorpay** account → copy test key ID + secret
4. Set up a **Gmail App Password** for sending recovery emails (Google Account → Security → 2FA → App Passwords)
5. Update `.env.local` with all credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `GMAIL_USER`, `GMAIL_APP_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` (e.g., `http://localhost:3000` for dev)
6. Run `npm run dev` → open http://localhost:3000
7. Register an account → set as admin in Supabase SQL:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
8. Go to `/admin` → start adding courses and videos
9. For production: deploy to Vercel, switch Razorpay to live mode, update `NEXT_PUBLIC_APP_URL`
