# Chitra Scientific — clickable prototype · PROJECT_GUIDE

Sales prototype for **Chitra Scientific Industries** (Valasaravakkam, Chennai — lab instruments, glassware, chemicals, lab furniture).
Built by Custom Software Developers to show the client the website + e-commerce + B2B platform quoted in
`Quotation CSD/Q/2026/11-01` (₹5,00,000, 3 releases). **No backend: all data is sample data in the browser.**

## Stack
- Angular 22 (standalone components, signals, zoneless, OnPush), SCSS, no UI library.
- Fonts bundled from npm: **Bricolage Grotesque** (display) + **Geist** (UI) — no Google Fonts call.
- Hosting: Vercel static (`vercel.json`: SPA rewrite, security headers, `noindex` so the demo is not indexed).
- English only. All data in the browser (`localStorage`, key `cs.db.v3`); footer has **Reset demo data**.

## Commands
```
npm install
npm start            # http://localhost:4200
npm run build        # → dist/chitra-scientific/browser
```
Deploy: push to GitHub → vercel.com → Add New → Project → import → Deploy. Or `npx vercel` in this folder.

## Design (v3 — see DESIGN_DIRECTION.md)
"A real company, shown plainly": the company's own logo and catalogue photographs (`public/img/`), Newsreader + Geist,
hairline-ruled grids, verifiable facts only (ISO 13485, Udyam MSME, GeM, brands, address, quality policy by Dr. K. Balu),
an open price list on the home page, light header/footer. `ui/hero-art.ts` and `ui/tint.ts` are v2 leftovers (unused on the home page).

## Home hero carousel (`ui/hero-carousel.ts`)
Four slides, auto-advance every 6.5 s with a progress bar per slide; pauses on hover/focus/hidden tab; Pause/Play, Previous/Next
and per-slide buttons; no autoplay with reduced motion; inactive slides are `inert`. Every slide is a full-bleed photo with the text over a neutral near-black left shade (rgba(10,14,18)) so photos keep their natural colours; brand green/maroon stay in the logo, top bar and buttons.
Slide change: the new photo wipes in from the right and slowly zooms out, old text exits left, the headline rises word by word, then the paragraph un-blurs and the buttons rise. The progress lines are visually hidden (still read by screen readers); only small previous / pause / next buttons show at bottom right.
1. `img/hero-lab.webp` — the client's own photograph (retouched, natural teal tones).
2. `img/hero-automation.webp` — automated liquid-handling instrument. Supplied at 500 px, upscaled — replace with a full-size original.
3. `img/hero-glassware.webp` — gloved hand holding a beaker. Unsplash photo-1617155093730, 1600 px.
4. `img/hero-tubes.webp` — sample tubes on a hospital analyser. Supplied at 500 px, upscaled — replace with a full-size original.
High-resolution replacements go in `../hero-photos/` (2-instruments.jpg, 3-glassware.jpg, 4-hospital.jpg). Confirm the licence of every stock photo before go-live.

## Catalogue in the prototype
Showcase only (client decision): the 10 categories that have a real photo (`CATEGORY_PHOTO` in `data/catalog.ts`), up to 8
products each plus the items used in the demo story — 95 products. The full 733-item list stays in `catalog-source.ts` and is
switched on by removing the showcase filter in `build()`.

## Structure
```
src/app/
  data/catalog-source.ts  product names from the client's PDF (spelling fixed; 30 categories, 7 groups)
  data/catalog.ts         Product objects: SAMPLE price (PRICE_HINTS for demo-story items, else deterministic in a band), brand, SKU, stock, specs, GST, HSN, icon by name; typo-tolerant search
  data/company.ts         company facts, industries, certificates (marked "current copy to be supplied"), brands, units
  state/models.ts         types, seed data (sample institutions/customers/orders/quotes/coupons/staff — invented names), PERMISSIONS per role, GST seller state
  state/store.ts          the whole state: catalogue + admin overrides, session, quote basket, cart, pricing (contract %), coupons, GST (CGST+SGST in TN, IGST outside), orders, payments, quotations, admin actions, CSV import, audit log
  state/guards.ts         customerGuard (account/checkout/pay)
  ui/                     icon (hand-drawn line icons), logo, hero-art, product-card, tint, format (₹, dates, rupees in words, validators)
  pages/home|products|category|product|search|quote   storefront
  pages/shop.ts           Login (mobile OTP demo 123456 + demo accounts), Register (institution), Cart, Checkout, Pay (generic DEMO gateway page)
  pages/account.ts        Account tabs (orders, quotations, addresses, institution & team, profile), OrderDetail (tracking, cancel, return), QuotationDetail (approve with PO / decline, print), Invoice (GST tax invoice, print)
  pages/admin.ts          AdminShell (staff picker login, role-based sidebar) + Dashboard, Orders (confirm → pack → ship with tracking, record payment), Quotations (price & send), Products (inline price/stock, buy-online toggle, hide, CSV import), Institutions (approve, contract %, credit days), Customers, Coupons, Reports (by category, top products, GST summary, CSV export with formula-injection guard), Content (announcement bar), Staff & roles (matrix), Audit log
  pages/info.ts           industries, about, certifications, brands, lab projects, contact, 404
```

## Demo script (for the client meeting)
1. Home → scroll: photo, credentials, real category photos, quality policy, open price list → search "buret" → product → **Add to cart**.
2. Sign in → **Individual buyer** → cart → coupon **LAB10** → checkout (change state to see CGST/SGST vs IGST) → demo payment → order + GST invoice.
3. Sign out → **College buyer**: contract prices (−12%) everywhere, green bar; Account → Quotations → approve CSQ/…/213 with PO upload → order on 30-day credit.
4. Footer → **Staff login** → Murugan (Store): no Reports/Staff; ship the order with tracking. Ramesh (Sales): price the school's quote and send. Dr. K. Balu (Owner): approve the hospital, change a price, see the Audit log and Reports.
5. Back in the store: the customer sees tracking; the new price is live.

## Rules in the prototype (the real build enforces them on the server)
- Hazardous chemicals and items above ₹1,50,000 are quote-only; coupons don't combine with contract prices; coupon min order and cap.
- Credit/PO payment only for approved institutions with credit days; PO number + PDF/image ≤ 5 MB required.
- OTP: 5 wrong codes → ask for a new code. Quantities 1–9999. Customers only see their own orders/invoices/quotations.
- Admin roles: Owner (all), Sales (quotes, prices, institutions, coupons), Store (stock, ship), Accounts (payments, reports).
- Every admin change is written to the audit log.

## Status
| Batch | Scope | State |
|---|---|---|
| 1 | Design system, website pages, catalogue, search, product pages, quote basket | ✅ 24 Nov 2026 |
| 2 | Store (cart, coupon, checkout, GST, demo payment, invoice, account, tracking, cancel/return) + B2B (institution registration, contract prices, credit, PO, quotations approve/decline, team) | ✅ 24 Nov 2026 |
| 3 | Admin panel (dashboard, orders, quotations, products + CSV import, institutions, customers, coupons, reports + CSV, content, staff & roles, audit) | ✅ 24 Nov 2026 |
| v2 design | Full visual redesign after feedback ("looks old") | ✅ 24 Nov 2026 |
| v3 design | Real logo + photos from the client catalogue, trust-first home, curated 95-product catalogue | ✅ 24 Nov 2026 |

## Tested
Playwright end-to-end (desktop 1440): checkout guarded → OTP validation and wrong-code count → sign-in returns to checkout → cart → coupon valid/invalid → IGST vs CGST+SGST → PIN validation → failed then successful demo payment → order + invoice → another customer cannot open that order or invoice (IDOR) → college sees contract price → quotation approve requires PO → order → Store role blocked from Reports → ship requires tracking number → Sales sends quotation → price edit → Owner approves institution → audit log shows changes → customer sees tracking → new price live on site. No console/page errors. Screenshots reviewed at 1440 px and 390 px.

## Not real (by design) — needed for production
Server API + database, real OTP/SMS, payment gateway (Razorpay) with signed webhooks, email/WhatsApp notifications, file storage for POs,
real product data/photos, current certificates, GSTIN, hosting. See the quotation for the full build.

## Status — 24 Nov 2026
- Demo complete with static (seeded) data across storefront, B2B and admin.
- End-to-end test `/tmp/flow2.py` passes all 15 checks (OTP sign-in, coupon, GST split, payment, invoice, IDOR block, contract price, quote→order, role limits, shipping, audit log, price change live).
- axe-core WCAG 2 A/AA audit: 0 violations on all 36 storefront, account and admin screens (admin sidebar contrast and badge colours fixed).
- Count wording pluralised (1 item / 2 items, 1 invoice).

## Admin — product management (added 24 Nov 2026)
Admin → Products supports the full product lifecycle:
- **Add product** (Owner, Sales): drawer form with name, category, brand (suggestions), SKU (auto-suggested, must be unique), pack, description,
  price before GST (shows price with GST), GST % (0/5/12/18/28), HSN (4–8 digits, pre-filled from the category), stock, sold as (buy online / quote only),
  **photos** and **specifications** (starter rows per department, e.g. glassware → Capacity, Material, Graduation, Accuracy class, Standard; up to 30 rows).
- **Edit** any product, including catalogue products (stored as overrides); **Hide/Show** keeps it in admin but off the website;
  **Delete** (Owner only) asks for confirmation, removes it from the website, carts and quote baskets; placed orders/quotations keep their copy.
- **Photos**: up to 6 per product, JPG/PNG/WebP ≤ 10 MB. Each file is decoded with `createImageBitmap` (SVG and fake files are rejected),
  resized to 1000 px and re-encoded as WebP (~40–60 KB). First photo = main; "Make main" reorders. Shown on product cards, a gallery with thumbnails on the
  product page, and as thumbnails in the admin list. Prototype stores photos as data URLs in localStorage (~4.5 MB cap with a clear message);
  the live system uploads them to server/object storage.
- Store API: `allProducts` (incl. hidden), `products` (website), `adminSaveProduct(p, isNew)` (validates + strips HTML), `adminDeleteProduct(slug)`.
  New permissions: `products.edit` (Owner, Sales), `products.delete` (Owner). Every add/edit/delete is in the audit log.
- Category product counts on Home and Products are live (`store.categoryCount`).
- Tests: `/tmp/crud.py` (add/validate/edit/hide/delete/roles/audit), `/tmp/img.py` (photo upload, rejection, gallery, persistence) — all pass;
  flow2 15/15; axe 0 violations including the open drawer.
