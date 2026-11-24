# Chitra Scientific — Website, Online Store & B2B Platform
## What the project needs, and how to configure everything (prototype → live)

Status (24 Nov 2026): the **clickable prototype is complete** (all screens, sample data, admin flows).
This file lists everything still required to turn it into the real, live platform, and the exact steps
to set each part up. `PROJECT_GUIDE.md` explains how the code works; this file explains what is needed
around it.

Owner legend: **[Client]** = Chitra Scientific provides / does it · **[Dev]** = we do it · **[Both]**

---

## Contents
1. Quick checklist
2. What we need from the client
3. Accounts and services (all in the client's name)
4. Developer machine setup
5. Configuration steps, service by service
6. Environment variables (`.env`)
7. Build plan, release by release
8. Testing before each release
9. Go-live checklist
10. Handover and after launch
11. Running costs (paid by the client)

---

## 1. Quick checklist

| # | Item | Owner | Lead time | Status |
|---|------|-------|-----------|--------|
| 1 | Prototype shown, scope + price agreed, quotation signed, 20% advance | Both | 1 week | ☐ |
| 2 | Product Excel (~600 items) + product photos | Client | 2–4 weeks | ☐ |
| 3 | Logo (high-res), company details, GSTIN, bank details, certificates | Client | 1 week | ☐ |
| 4 | Domain access (chitrascientific.in) | Client | 1 day | ☐ |
| 5 | Razorpay account + KYC | Client (Dev guides) | 1–2 weeks | ☐ |
| 6 | ~~SMS / DLT~~ — not needed: customers sign in with email + password (decided 24 Nov 2026) | — | — | n/a |
| 7 | WhatsApp Business API (Meta verification + templates) | Client (Dev guides) | 1–3 weeks | ☐ |
| 8 | Cloud hosting: server, PostgreSQL, storage, backups | Dev (client's account) | 1 day | ☐ |
| 9 | Transactional email (orders, enquiries) | Dev | 1 day | ☐ |
| 10 | Google Analytics, Search Console, Business Profile | Dev | 1 day | ☐ |
| 11 | Release A — website + catalogue live | Dev | Weeks 1–5 | ☐ |
| 12 | Release B — online store live | Dev | Weeks 6–13 | ☐ |
| 13 | Release C — B2B + admin live | Dev | Weeks 14–20 | ☐ |
| 14 | Training, handover, sign-off, final payment | Both | Week 20 | ☐ |

**Start items 2, 5 and 7 immediately** — they depend on the client and take the longest.

---

## 2. What we need from the client

### 2.1 Product data (Excel) — [Client]
One row per product (or per variant). Template columns:

| Column | Example | Notes |
|---|---|---|
| sku | CSI-CHE-1086 | Unique item code |
| name | Burette 50 ml, Class A | |
| category | Chemistry apparatus | Must match the agreed category list |
| sub_category | Burettes | Optional |
| brand | Borosil | |
| pack | Each / Pack of 10 / 500 g | |
| price | 2450 | Rupees, **before GST** |
| gst_pct | 18 | 0, 5, 12, 18 or 28 |
| hsn | 7017 | 4–8 digits |
| stock | in / low / order | |
| sold_as | online / quote | `quote` = price on request (restricted chemicals, large equipment) |
| description | Short paragraph | |
| spec_1_name … spec_n_value | Capacity = 50 ml | As many spec pairs as needed |
| photo_files | burette-50-1.jpg; burette-50-2.jpg | Matching file names in a photos folder |
| brochure_file | burette.pdf | Optional download |

If the client cannot provide this, offer the **data entry service** (₹100 per product, in the quotation).

### 2.2 Photos — [Client]
- Product photos: plain/white background, at least 1000 px, JPG/PNG.
- Company photos: team, warehouse, installed labs (replace stock photos on the home page).
- Licence: only the client's own photos or free-licence stock (Pexels/Unsplash). Current home-page photos are Pexels (see `PROJECT_GUIDE.md`).

### 2.3 Company and legal — [Client]
- High-resolution logo (SVG or PNG ≥ 1000 px).
- Legal name, address, phone numbers, email, GSTIN, PAN, state code (Tamil Nadu = 33).
- Bank details to print on invoices (for bank transfer / PO customers).
- Current certificates (ISO 9001, ISO 13485, Udyam, GeM) as PDF/images with validity dates.
- Invoice number format and starting number (e.g. CSI/2026-27/0001).
- Policies: shipping (areas, charges, free-shipping limit), returns, cancellation, refund.
- Chemicals: which can be sold online, which are quote-only, any buyer declaration / licence rules.

### 2.4 B2B rules — [Client]
- Institution types allowed; documents needed for approval.
- Default contract discount and credit days; who approves.
- Quotation validity (days), quotation terms text.
- Staff list with roles: Owner, Sales, Store & dispatch, Accounts.

### 2.5 Access — [Client]
- Domain registrar login (or add DNS records we send).
- A company email (and phone) for each service account (Razorpay, Meta, hosting) — owned by the company.

---

## 3. Accounts and services (opened in the client's name)

| Service | Purpose | Suggested provider | Who pays |
|---|---|---|---|
| Domain | chitrascientific.in | Existing registrar | Client |
| Frontend hosting | Angular site with server-side rendering | Vercel Pro or the same VPS | Client |
| API server | NestJS API | AWS Lightsail / DigitalOcean / Hetzner VPS (Mumbai or Singapore region) | Client |
| Database | PostgreSQL 16 | Managed PostgreSQL (DigitalOcean / AWS RDS / Neon) | Client |
| File storage | Product photos, PO uploads, invoices | S3-compatible (AWS S3 / DigitalOcean Spaces / Cloudflare R2) | Client |
| Payments | UPI, cards, net banking | Razorpay | Client (per transaction) |
| WhatsApp | Order updates | WhatsApp Business API via a BSP (e.g. MSG91, Gupshup, Interakt) or Meta Cloud API | Client (per conversation) |
| Email | Account confirmation, password reset, order / enquiry emails (**required** — sign-in depends on it) | Amazon SES / Brevo / Zoho ZeptoMail | Client |
| Error monitoring | Crash alerts | Sentry (free tier) | Client |
| Uptime monitoring | Site-down alerts | UptimeRobot / Better Stack (free tier) | Client |
| Analytics | Traffic, conversions | Google Analytics 4 + Search Console | Free |
| Source code | Repository | GitHub (`yogeshwaran-venkatesan/chitra-scientific-lab`, transfer to client at handover) | Free |

Rule: **every account is opened with the company's email and phone.** We are added as a team member / developer, never the owner.

---

## 4. Developer machine setup — [Dev]

| Tool | Version | Check |
|---|---|---|
| Node.js | 22.22.3+ or 24.15+ (Angular CLI 22 requirement) | `node -v` |
| npm | 10+ | `npm -v` |
| Angular CLI | 22 (project-local, `npx ng`) | `npx ng version` |
| NestJS CLI | latest | `npx @nestjs/cli --version` |
| PostgreSQL | 16 (local or Docker) | `psql --version` |
| Docker Desktop | optional, for local DB | `docker -v` |
| Git | any recent | `git --version` |

```bash
# frontend (this repository)
cd "D:\New Folder\e-commerce\chitra-scientific"
npm install
npm start                 # http://localhost:4200
npm run build             # production build → dist/
npm run preview           # serve the built site (works on older Node)

# local database (Docker)
docker run --name cs-db -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=chitra -p 5432:5432 -d postgres:16
```

Planned repository layout once the backend starts:
```
chitra-scientific/        Angular website + store + admin (this repo, becomes apps/web)
api/                      NestJS API (new)
  src/modules/            auth, products, catalog, cart, orders, payments, invoices,
                          quotations, institutions, staff, audit, reports, content, notify, files
  prisma/ or migrations/  database schema + migrations
  .env.example
```

---

## 5. Configuration steps, service by service

### 5.1 Domain and DNS — [Client gives access, Dev configures]
1. Log in to the domain registrar for `chitrascientific.in`.
2. Add the records the hosts give us:
   - `A` / `CNAME` for `www` and root → frontend host (Vercel or VPS).
   - `A` for `api.chitrascientific.in` → API server IP.
   - Email sending records: `SPF` (TXT), `DKIM` (CNAME/TXT), `DMARC` (TXT `v=DMARC1; p=none; rua=mailto:…`).
   - Google Search Console verification TXT.
3. Redirect root → `https://www.chitrascientific.in` (or the reverse — pick one).
4. HTTPS: automatic on Vercel; on a VPS use Caddy or Nginx + Let's Encrypt (auto-renew).

### 5.2 Hosting — [Dev, in client's account]
**Frontend**
1. Import the GitHub repo into Vercel (Add New → Project). Framework: Angular; build `npm run build`; output `dist/chitra-scientific/browser` (SSR output once enabled).
2. Add environment variables (section 6, frontend part). Attach the domain.
3. Remove the `noindex` header from `vercel.json` **only at go-live** (the prototype blocks search engines on purpose).

**API server (VPS)**
1. Create an Ubuntu 24.04 VPS, 2 vCPU / 4 GB RAM, Mumbai region.
2. Create a non-root user, SSH keys only, disable password login, enable the firewall (allow 22, 80, 443 only).
3. Install Node 22/24, PM2 (or Docker), Caddy/Nginx as reverse proxy → API on port 3000.
4. Deploy: GitHub Actions on push to `main` → build → copy → `pm2 reload`.

**Database**
1. Create managed PostgreSQL 16, same region. Allow connections only from the API server.
2. Create a database user for the app (not the admin user). Store the URL in `DATABASE_URL`.
3. Turn on daily automatic backups (7–30 days retention). **Test a restore** once before go-live.

**File storage**
1. Create a private bucket `chitra-files` (POs, invoices) and a public bucket or CDN path for product photos.
2. Create access keys limited to these buckets. Uploads go through the API: check type (JPG/PNG/WebP/PDF), size limit, re-encode images, random file names.

### 5.3 Razorpay — [Client signs up, Dev integrates]
1. Client signs up at razorpay.com with the company email/phone; completes KYC (PAN, GSTIN, bank account, address proof, website URL, business category). Approval ~1–2 weeks. The website must show contact details, privacy, terms, shipping and refund policy pages — Razorpay checks these.
2. Invite the developer as a team member.
3. **Test mode first**: Settings → API Keys → generate test `key_id` / `key_secret`.
4. Webhooks: add `https://api.chitrascientific.in/payments/webhook`, set a webhook secret, enable events `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.
5. Integration rules (already planned in the quotation):
   - The server creates the Razorpay order with the **server-calculated** total — never the browser's amount.
   - Verify the checkout signature (HMAC-SHA256 of `order_id|payment_id` with `key_secret`) before marking paid.
   - Also confirm via the webhook (verify `X-Razorpay-Signature`); handle duplicates (idempotent).
   - Refunds from the admin panel through the Refunds API.
6. Before go-live: switch to **live keys**, make one small real payment, refund it.

### 5.4 Customer sign-in — email + password (no SMS) — [Dev]
Decision (24 Nov 2026): customers and institutions sign in with **email + password**. No DLT registration, no SMS provider,
no per-OTP cost. The mobile number is collected only as a delivery/contact number. Order updates go by email and WhatsApp.

**Sign-up**
1. Name, email, mobile (contact only), password + confirm. Institution sign-up adds the organisation fields and document.
2. Password rules (same as the prototype's `passwordProblem()`): 8–128 characters, at least one letter and one number,
   refuse common passwords and passwords containing the email name.
3. Store **Argon2id** hash only (`argon2` npm package; memory ≥ 19 MB, iterations ≥ 2). Never log or email passwords.
4. Send an **email confirmation link** (random 32-byte token, stored hashed, valid 24 h, single use). Unconfirmed accounts can browse
   and use the quote basket, but must confirm before the first paid order.

**Sign-in and sessions**
1. Email + password → server sets an **HttpOnly, Secure, SameSite=Lax session cookie** (or a short-lived JWT + refresh token in an HttpOnly cookie).
2. "Keep me signed in" (default on): session lasts 30 days on that device, so closing the tab does **not** log the customer out.
   Unticked: session ends when the browser closes. Staff sessions: 8 hours.
3. Same error for wrong email or wrong password ("Email or password is not right") — do not reveal which emails exist.
4. Rate limits: 5 wrong attempts per account → 15-minute lock; per-IP limit on `/auth/login`; captcha (Cloudflare Turnstile / hCaptcha)
   after 3 failures and on sign-up.
5. Every sign-in, password change and reset is written to the audit log.

**Forgot / reset password**
1. "Forgot password?" → email → always show the same message ("If an account exists…").
2. Email a reset link: random token, stored hashed, valid **30 minutes**, single use.
3. New password follows the same rules; on success, sign out all other sessions and send a "your password was changed" email.

**Change password (My account → Profile)**: current password + new + confirm; other sessions signed out; notification email.

**Staff (admin)**: email + password, 8-hour sessions; optional second step for the Owner with an authenticator app (TOTP, e.g. Google Authenticator).
No SMS needed here either.

**Later options (no SMS cost)**: "Sign in with Google", or a WhatsApp one-time code through the WhatsApp Business API — can be added without changing the design.

### 5.5 WhatsApp Business API — [Client verifies, Dev configures]
1. Use a **new or dedicated number** (a number on the WhatsApp app must be removed from the app first).
2. Create a Meta Business account in the company name; complete **business verification** (GST/registration documents).
3. Choose the route: a BSP (MSG91 / Gupshup / Interakt — easier, Indian billing) or Meta Cloud API directly.
4. Register the number, display name "Chitra Scientific", profile photo = logo.
5. Create **utility templates** (need Meta approval): order confirmed, order shipped, quotation ready, payment reminder.
6. Store the API key / phone-number ID / template names in `.env`. Customers must opt in (checkbox at checkout/registration).
7. The floating WhatsApp chat button on the site works without the API (simple `wa.me` link) — it can go live in Release A.

### 5.6 Email — [Dev]
1. Pick a provider (Amazon SES, Brevo or ZeptoMail); verify the domain with SPF + DKIM records (5.1).
2. Sender: `orders@chitrascientific.in`, reply-to the sales inbox.
3. Templates: enquiry received (to company + auto-reply), order confirmation with invoice PDF, shipped, quotation sent, institution approved, password/OTP fallback.
4. SES only: request production access (leave sandbox).

### 5.7 Google — [Dev]
1. Google Analytics 4 property → measurement ID in the frontend env; e-commerce events (view_item, add_to_cart, begin_checkout, purchase).
2. Search Console: verify domain (DNS TXT), submit `sitemap.xml` after go-live.
3. Google Business Profile: claim/update address, hours, phone, website link, photos.
4. Cookie/consent notice if analytics/ads are used.

### 5.8 Monitoring and backups — [Dev]
1. Sentry for frontend and API errors (DSNs in env).
2. UptimeRobot checks: home page, `api…/health`, every 5 minutes, alerts to the developer and client email.
3. Database: daily automated backup + weekly export kept in a second location; restore test before go-live.
4. Log rotation on the server; alerts on disk > 80%.

### 5.9 Security baseline — [Dev]
- HTTPS everywhere, HSTS, secure headers (CSP, X-Frame-Options, Referrer-Policy).
- All prices, discounts, GST and totals recalculated on the server; never trust the browser.
- Every order/invoice/quotation query filtered by the signed-in customer or institution (no IDOR).
- Staff permissions checked on the API for every action (the prototype's role matrix, enforced server-side).
- Passwords hashed with Argon2id; reset/confirm tokens hashed, single-use, short expiry; HttpOnly secure session cookies.
- Rate limits and lockout on login, password reset, enquiry and checkout; captcha on sign-up and after failed logins.
- Validated uploads (type, size, re-encoding); no SVG/HTML uploads.
- Parameterised queries via the ORM; input validation with DTOs.
- Secrets only in env variables / secret manager, never in Git.
- Audit log for prices, stock, orders, institutions, staff changes.
- Staff accounts: email + password (+ authenticator app for the Owner), 8-hour session timeout, disable on exit.

---

## 6. Environment variables (`.env`)

Never commit real values. Keep `api/.env.example` with empty values in Git.

```ini
# ---- API (NestJS) ----
NODE_ENV=production
PORT=3000
APP_URL=https://www.chitrascientific.in
API_URL=https://api.chitrascientific.in
DATABASE_URL=postgresql://app_user:********@db-host:5432/chitra?sslmode=require
JWT_SECRET=                     # long random string
JWT_EXPIRES_IN=7d
STAFF_SESSION_HOURS=8
CORS_ORIGINS=https://www.chitrascientific.in

# Company (printed on invoices)
COMPANY_NAME=Chitra Scientific Industries
COMPANY_GSTIN=
COMPANY_STATE_CODE=33
INVOICE_PREFIX=CSI/2026-27/

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Customer auth (email + password)
SESSION_SECRET=                 # long random string
SESSION_DAYS_REMEMBER=30
AUTH_MAX_FAILS=5
AUTH_LOCK_MINUTES=15
RESET_TOKEN_MINUTES=30
CAPTCHA_SITE_KEY=
CAPTCHA_SECRET=

# WhatsApp Business API
WHATSAPP_PROVIDER=msg91        # or meta
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TEMPLATE_ORDER=
WHATSAPP_TEMPLATE_SHIPPED=
WHATSAPP_TEMPLATE_QUOTE=

# Email
MAIL_PROVIDER=ses               # or brevo / zeptomail
MAIL_FROM=orders@chitrascientific.in
MAIL_SALES_INBOX=
MAIL_API_KEY=

# File storage (S3-compatible)
S3_ENDPOINT=
S3_REGION=ap-south-1
S3_BUCKET_PRIVATE=chitra-files
S3_BUCKET_PUBLIC=chitra-media
S3_ACCESS_KEY=
S3_SECRET_KEY=
MEDIA_BASE_URL=

# Monitoring
SENTRY_DSN_API=

# ---- Frontend (Angular environment.prod.ts / Vercel env) ----
API_BASE_URL=https://api.chitrascientific.in
RAZORPAY_KEY_ID_PUBLIC=         # key_id only, never the secret
GA4_MEASUREMENT_ID=
SENTRY_DSN_WEB=
WHATSAPP_NUMBER=919751513734
```

---

## 7. Build plan, release by release

### Release A — Website + catalogue (weeks 1–5) · payment 2 (20%) on go-live
- [ ] NestJS project, PostgreSQL schema: categories, products, specs, photos, brands, content, enquiries
- [ ] Excel importer (columns in 2.1) with error report; import ~600 products and photos
- [ ] Replace the prototype's sample catalogue (`data/catalog.ts`) with API calls
- [ ] Angular SSR (server-side rendering) for SEO; titles, meta descriptions, Open Graph, `sitemap.xml`, `robots.txt`, product structured data
- [ ] Enquiry form + quote basket → saved in DB + email to company + auto-reply
- [ ] Admin: products/categories/photos/specs/banner/certificates saved on the server (replace localStorage); staff login
- [ ] Policy pages (privacy, terms, shipping, returns) with client-approved text
- [ ] Replace home stock photos with client photos where available
- [ ] Domain, HTTPS, analytics, Search Console; remove `noindex`

### Release B — Online store (weeks 6–13) · payment 3 (20%) at demo, payment 4 (15%) at go-live
- [ ] Customers: email + password sign-up, email confirmation link, sign-in with "keep me signed in", forgot/reset password, change password, addresses, profile
- [ ] Cart and checkout with server-side pricing, coupons, bulk discounts, shipping charges
- [ ] Razorpay: create order, verify signature, webhook, failure handling, refunds
- [ ] GST: CGST+SGST inside Tamil Nadu, IGST outside; per-item HSN and rate; buyer GSTIN
- [ ] Invoice PDF with sequential numbers per financial year; stored in private storage
- [ ] Order lifecycle: placed → confirmed → packed → shipped (courier + tracking no.) → delivered; cancel/return requests
- [ ] Notifications: email + WhatsApp templates (no SMS); new-order alert to staff
- [ ] Customer area: orders, invoices, re-order
- [ ] Test-site demo → fixes → go-live with live Razorpay keys

### Release C — B2B + admin (weeks 14–20) · payment 5 (15%) at demo, payment 6 (10%) at handover
- [ ] Institution registration, document upload, approval by staff, multiple users per institution
- [ ] Contract discount per institution, credit days, credit outstanding
- [ ] Quotation request from basket/cart → staff pricing → quotation PDF + email → approve with PO upload → order
- [ ] Quotation validity and reminders (scheduled job)
- [ ] Staff roles enforced in the API (Owner, Sales, Store & dispatch, Accounts) + audit log
- [ ] Reports: sales by day/month/category, top products/customers, pending quotations, unpaid POs, GST summary; Excel export
- [ ] Low-stock alerts; Excel price/stock import

---

## 8. Testing before each release

| Type | What | Tool |
|---|---|---|
| Unit | Price, GST, coupon, invoice number logic | Jest (API), Vitest (web) |
| API | Every endpoint, permissions per role | Jest + Supertest |
| End-to-end | Browse → cart → pay → invoice; quote → PO → order; every staff role | Playwright (the prototype tests in `PROJECT_GUIDE.md` are the starting point) |
| Payments | Success, failure, cancel, webhook replay, refund | Razorpay test mode |
| Security | Price tampering, other customers' orders (IDOR), role bypass, SQL injection, XSS, password brute force / credential stuffing, reset-token reuse, account enumeration, fake sign-ups, card testing, upload attacks | Playwright scripts + OWASP ZAP baseline scan |
| Accessibility | WCAG 2 A/AA, 0 violations | axe-core |
| Performance | Home/product pages fast on mobile | Lighthouse |
| Devices | Android Chrome, iPhone Safari, desktop Chrome/Edge | Manual |
| Backups | Restore last backup into a test database | Manual, before go-live |

---

## 9. Go-live checklist (each release)

- [ ] Client approved the test site in writing
- [ ] Live keys set (Razorpay, WhatsApp, email, captcha); test keys removed
- [ ] Password reset and confirmation emails arrive in Gmail/Outlook inbox (not spam)
- [ ] `noindex` removed; sitemap submitted
- [ ] HTTPS, redirects (http → https, root ↔ www) working
- [ ] Backups on and one restore tested
- [ ] Sentry + uptime monitors sending alerts
- [ ] One real ₹1 order paid and refunded; invoice correct
- [ ] Staff accounts created with correct roles; default/demo accounts removed
- [ ] Prototype demo data and "sample data" notes removed
- [ ] `PROJECT_GUIDE.md` and this file updated; release tagged in Git

---

## 10. Handover and after launch

**Handover (week 20)**
- Training session for owner and staff (orders, quotations, products, institutions, reports) + short user guide (PDF).
- Hand over: all account logins (company-owned), GitHub repo transferred to the client's account, `.env` values via a password manager (never by email/WhatsApp), `PROJECT_GUIDE.md`, this file.
- Written sign-off → final 10% payment.

**After launch**
- 3 months free bug fixing: weekly check of payments, errors (Sentry), backups, uptime.
- Month 1: check Search Console indexing and fix crawl errors.
- Before month 3 ends: propose annual maintenance (₹1,00,000/year — updates, security patches, backup checks, up to 8 h/month of small changes).
- Optional later work: Tally/ERP integration, GeM listing support, marketing/SEO campaigns, mobile app.

---

## 11. Running costs (paid directly by Chitra Scientific)

| Item | Approximate cost |
|---|---|
| Domain renewal | ~₹1,000 / year |
| Hosting: server, database, storage, backups, email | ₹3,000 – ₹8,000 / month depending on traffic |
| Razorpay | ~2% + 18% GST per online payment; no setup or yearly fee (standard plan, Nov 2026) |
| SMS | **Not needed** — sign-in is email + password (saves DLT fee and per-SMS cost) |
| WhatsApp Business API | Per conversation, billed by Meta / the BSP |
| Vercel Pro (if used) | ~$20 / month |
| Sentry, uptime monitor | Free tiers are enough to start |

Prices are as published in Nov 2026 and change over time — confirm on each provider's site before quoting.
