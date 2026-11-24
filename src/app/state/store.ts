import { Injectable, computed, effect, signal } from '@angular/core';
import { PRODUCTS, Product, slugify } from '../data/catalog';
import {
  Address, AuditEntry, Coupon, Customer, DB, FREE_SHIPPING_FROM, Institution, Order, OrderLine, OrderStatus, PayMethod,
  DEMO_PW, QuoteLine, Quotation, Role, SELLER_STATE, SHIPPING_FEE, Staff, iso, seed,
} from './models';

export interface Line { slug: string; qty: number }
export interface Totals { subtotal: number; discount: number; shipping: number; cgst: number; sgst: number; igst: number; total: number; couponError?: string }

const KEY = 'cs.db.v3';
const r2 = (n: number) => Math.round(n * 100) / 100;

/** prototype-only password hash (SHA-256 of "cs:<email>:<password>"); the live API uses Argon2id on the server */
export async function pwHash(email: string, password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`cs:${email.trim().toLowerCase()}:${password}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** password rules shared by sign-up, reset and change-password */
const COMMON_PW = ['password', 'password1', 'password123', '12345678', '123456789', '1234567890', 'qwerty123', 'iloveyou', 'admin123', 'welcome1', 'chitra123', 'abcd1234'];
export function passwordProblem(pw: string, email = ''): string | null {
  if (pw.length < 8) return 'Use at least 8 characters.';
  if (pw.length > 128) return 'Use 128 characters or fewer.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Use at least one letter and one number.';
  if (COMMON_PW.includes(pw.toLowerCase())) return 'This password is too common — choose another.';
  if (email && pw.toLowerCase().includes(email.split('@')[0].toLowerCase()) && email.split('@')[0].length > 3) return 'Do not use your email name in the password.';
  return null;
}

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, v: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private mode: memory only */ }
}

/**
 * The whole prototype's state. In the real product every one of these actions is an API call and every rule
 * (price, contract discount, GST, coupon limits, stock, who may do what) is enforced on the server.
 */
@Injectable({ providedIn: 'root' })
export class Store {
  readonly db = signal<DB>(this.initialDb());
  readonly basket = signal<Line[]>(load('cs.basket', []));
  readonly cart = signal<Line[]>(load('cs.cart', []));
  readonly customerId = signal<string | null>(load('cs.customer', null));
  readonly staffId = signal<string | null>(load('cs.staff', null));
  readonly toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  // ── catalogue (with admin edits applied) ──
  /** every product the admin can manage: catalogue + admin-created, edits applied, deleted ones removed (hidden ones kept) */
  readonly allProducts = computed<Product[]>(() => {
    const o = this.db().overrides;
    return [...PRODUCTS, ...(this.db().added ?? [])].filter((p) => !o[p.slug]?.deleted)
      .map((p) => (o[p.slug] ? { ...p, ...o[p.slug] } as Product : p));
  });
  /** what the website shows */
  readonly products = computed<Product[]>(() => { const o = this.db().overrides; return this.allProducts().filter((p) => !o[p.slug]?.hidden); });
  readonly categoryCount = computed(() => {
    const m = new Map<string, number>();
    for (const p of this.products()) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  });
  isHidden(slug: string): boolean { return !!this.db().overrides[slug]?.hidden; }
  readonly bySlug = computed(() => new Map(this.products().map((p) => [p.slug, p])));
  product(slug: string): Product | undefined { return this.bySlug().get(slug); }

  // ── who is signed in ──
  readonly customer = computed<Customer | null>(() => this.db().customers.find((c) => c.id === this.customerId()) ?? null);
  readonly institution = computed<Institution | null>(() => {
    const c = this.customer();
    return c?.institutionId ? this.db().institutions.find((i) => i.id === c.institutionId) ?? null : null;
  });
  /** contract prices only once the institution is approved */
  readonly contractPct = computed(() => (this.institution()?.status === 'APPROVED' ? this.institution()!.contractPct : 0));
  readonly staff = computed<Staff | null>(() => this.db().staff.find((s) => s.id === this.staffId() && s.active) ?? null);

  // ── basket & cart ──
  readonly basketCount = computed(() => this.basket().reduce((s, l) => s + l.qty, 0));
  readonly basketItems = computed(() => this.basket().map((l) => ({ ...l, product: this.product(l.slug) as Product })).filter((x) => x.product));
  readonly cartCount = computed(() => this.cart().reduce((s, l) => s + l.qty, 0));
  readonly cartItems = computed(() =>
    this.cart().map((l) => ({ ...l, product: this.product(l.slug) as Product })).filter((x) => x.product && !x.product.enquiryOnly)
      .map((x) => ({ ...x, unit: this.unitPrice(x.product) })));

  readonly myOrders = computed(() => this.db().orders.filter((o) => o.customerId === this.customerId()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  readonly myQuotes = computed(() => this.db().quotes.filter((q) => q.customerId === this.customerId()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  readonly pendingQuoteCount = computed(() => this.myQuotes().filter((q) => q.status === 'QUOTED').length);

  constructor() {
    effect(() => save(KEY, this.db()));
    effect(() => save('cs.basket', this.basket()));
    effect(() => save('cs.cart', this.cart()));
    effect(() => save('cs.customer', this.customerId()));
    effect(() => save('cs.staff', this.staffId()));
  }

  private initialDb(): DB {
    const d = load<DB | null>(KEY, null);
    if (d && d.v === 3 && Array.isArray(d.orders)) {
      // older demo data had no passwords: give the demo customers theirs
      for (const c of d.customers) if (!c.pw && DEMO_PW[c.email]) c.pw = DEMO_PW[c.email];
      return d;
    }
    return this.seedWithOrders();
  }

  /** Sample orders and quotations so the account and admin screens have history on first open. */
  private seedWithOrders(): DB {
    const db = seed();
    const P = (slug: string) => PRODUCTS.find((p) => p.slug === slug)!;
    const mk = (customerId: string, items: Array<[string, number]>, daysAgo: number, status: OrderStatus, pay: PayMethod, extra: Partial<Order> = {}): Order => {
      const c = db.customers.find((x) => x.id === customerId)!;
      const inst = c.institutionId ? db.institutions.find((i) => i.id === c.institutionId) : undefined;
      const pct = inst?.status === 'APPROVED' ? inst.contractPct : 0;
      const lines: OrderLine[] = items.map(([s, q]) => {
        const p = P(s);
        return { slug: s, name: p.name, sku: p.sku, qty: q, unit: r2(p.price * (1 - pct / 100)), gstPct: p.gstPct, hsn: p.hsn };
      });
      const addr = c.addresses[0] ?? { name: c.name, line1: inst?.dept ?? '', line2: inst?.name ?? '', city: inst?.city ?? 'Chennai', state: inst?.state ?? 'Tamil Nadu', pin: '600001', phone: c.phone };
      const t = computeTotals(lines, addr.state, 0);
      db.seq.order++;
      const steps: OrderStatus[] = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
      const upto = steps.indexOf(status);
      const history = steps.slice(0, upto + 1).map((s, i) => ({ status: s, at: iso(daysAgo - i * 0.6, 10 + i), by: i === 0 ? c.name : 'Chitra Scientific' }));
      const o: Order = {
        id: `o-${db.seq.order}`, number: `CSI/${new Date().getFullYear()}/${db.seq.order}`, customerId: c.id, customerName: c.name,
        institutionId: inst?.id, institutionName: inst?.name, lines, ...t, address: addr, buyerGstin: inst?.gstin,
        pay, paid: pay === 'ONLINE' || status === 'DELIVERED', paymentRef: pay === 'ONLINE' ? `pay_DEMO${db.seq.order}` : undefined,
        status, history, createdAt: iso(daysAgo, 10), invoiceNo: `INV/${++db.seq.invoice}`,
        tracking: upto >= 3 ? `DTDC${7300000 + db.seq.order}` : undefined, courier: upto >= 3 ? 'DTDC Courier' : undefined, ...extra,
      };
      if (pay === 'CREDIT') { o.poNumber = `SLASC/CHEM/PO/${100 + db.seq.order % 50}`; o.poFile = 'purchase-order.pdf'; o.dueDate = iso(daysAgo - 30); }
      return o;
    };
    db.orders = [
      mk('c-college', [['burettes', 10], ['conical-flasks', 24], ['pipettes', 20], ['beakers', 30]], 26, 'DELIVERED', 'CREDIT'),
      mk('c-college', [['water-bath', 2], ['magnetic-stirrer', 3]], 6, 'SHIPPED', 'CREDIT'),
      mk('c-priya', [['polypropylene-beakers', 2], ['wash-bottles-ldpe', 2], ['micropipette-tips', 1]], 3, 'CONFIRMED', 'ONLINE'),
      mk('c-priya', [['analytical-weighing-balance', 1]], 40, 'DELIVERED', 'ONLINE'),
    ];
    const ql = (items: Array<[string, number]>, pct: number): QuoteLine[] => items.map(([s, q]) => {
      const p = P(s);
      return { slug: s, name: p.name, sku: p.sku, qty: q, list: p.price, offer: r2(p.price * (1 - pct / 100)), gstPct: p.gstPct };
    });
    db.quotes = [
      { id: 'q-1', number: `CSQ/${new Date().getFullYear()}/${++db.seq.quote}`, customerId: 'c-college', customerName: 'Dr. R. Meena', org: 'Sri Lakshmi Arts & Science College — Chemistry', email: 'chemistry@slasc.example.in', phone: '9840012345', institutionId: 'i-slasc',
        lines: ql([['hot-air-oven', 1], ['water-bath', 2], ['desiccators', 6], ['separating-funnels', 20]], 15), note: 'For new PG lab — need before practical exams.', status: 'QUOTED', validTill: iso(-14), freight: 0, terms: 'Delivery in 10 days. Installation of oven included. Payment: 30 days credit against PO.', createdAt: iso(4), quotedAt: iso(3) },
      { id: 'q-2', number: `CSQ/${new Date().getFullYear()}/${++db.seq.quote}`, customerId: 'c-college', customerName: 'S. Karthik', org: 'Sri Lakshmi Arts & Science College — Chemistry', email: 'lab.chem@slasc.example.in', phone: '9840012399', institutionId: 'i-slasc',
        lines: ql([['kjeldahl-distillation-apparatus', 1]], 0), note: 'Please quote the 6-place model with installation.', status: 'REQUESTED', freight: 0, createdAt: iso(1) },
      { id: 'q-3', number: `CSQ/${new Date().getFullYear()}/${++db.seq.quote}`, customerName: 'Anand Kumar', org: 'Green Valley Matriculation School', email: 'anand@gvschool.example.in', phone: '9003012345',
        lines: ql([['physics-charts-set', 2], ['vernier-calipers', 15], ['screw-gauge', 15], ['meter-bridge', 4]], 0), status: 'REQUESTED', freight: 0, createdAt: iso(0.3) },
    ];
    db.audit = [
      { at: iso(3, 9), who: 'Ramesh', role: 'SALES', what: 'Sent quotation CSQ/' + new Date().getFullYear() + '/213 to Sri Lakshmi Arts & Science College' },
      { at: iso(6, 16), who: 'Murugan', role: 'STORE', what: `Marked order ${db.orders[1].number} as shipped (DTDC)` },
      { at: iso(10, 12), who: 'Dr. K. Balu', role: 'OWNER', what: 'Changed contract discount for Sri Lakshmi Arts & Science College from 10% to 12%' },
    ];
    return db;
  }

  // ── pricing ──
  unitPrice(p: Product): number { return r2(p.price * (1 - this.contractPct() / 100)); }

  totals(lines: Array<{ unit: number; qty: number; product?: Product; gstPct?: number }>, state: string, couponCode = ''): Totals {
    const ls = lines.map((l) => ({ unit: l.unit, qty: l.qty, gstPct: l.gstPct ?? l.product?.gstPct ?? 18 }));
    const subtotal = r2(ls.reduce((s, l) => s + l.unit * l.qty, 0));
    let discount = 0;
    let couponError: string | undefined;
    const code = couponCode.trim().toUpperCase();
    if (code) {
      const c = this.db().coupons.find((x) => x.code === code);
      if (!c || !c.active) couponError = 'This coupon code is not valid.';
      else if (this.contractPct() > 0) couponError = 'Coupons cannot be combined with your contract prices.';
      else if (subtotal < c.minOrder) couponError = `This coupon needs an order of at least ₹${c.minOrder.toLocaleString('en-IN')} before GST.`;
      else discount = Math.min(c.max, r2((subtotal * c.pct) / 100));
    }
    return { ...computeTotals(ls.map((l) => ({ ...l })), state, discount), couponError };
  }

  // ── session ──
  loginCustomer(id: string): void {
    this.customerId.set(id);
    const c = this.customer();
    this.say(`Signed in as ${c?.name}`);
    this.log('CUSTOMER', c?.name ?? id, 'Signed in to the store');
  }
  logoutCustomer(): void { this.customerId.set(null); this.say('Signed out'); }
  loginStaff(id: string): void {
    this.staffId.set(id);
    this.log(this.staff()?.role ?? 'SYSTEM', this.staff()?.name ?? id, 'Signed in to admin');
  }
  logoutStaff(): void { this.staffId.set(null); }
  findCustomerByPhone(phone: string): Customer | undefined { return this.db().customers.find((c) => c.phone === phone); }
  findCustomerByEmail(email: string): Customer | undefined { const e = email.trim().toLowerCase(); return this.db().customers.find((c) => c.email.toLowerCase() === e); }

  /** prototype password check. Live: POST /auth/login, Argon2id verify on the server, rate-limited. */
  async checkPassword(email: string, password: string): Promise<Customer | null> {
    const c = this.findCustomerByEmail(email);
    const h = await pwHash(email, password);
    return c && c.pw && c.pw === h ? c : null;
  }
  async setPassword(id: string, password: string): Promise<void> {
    const c = this.db().customers.find((x) => x.id === id);
    if (!c) return;
    const h = await pwHash(c.email, password);
    this.mut((d) => { d.customers.find((x) => x.id === id)!.pw = h; });
    this.log('CUSTOMER', c.name, 'Changed password');
  }

  registerRetail(name: string, phone: string, email: string, pw?: string): Customer {
    const c: Customer = { id: `c-${Date.now()}`, name, phone, email, pw, kind: 'RETAIL', addresses: [] };
    this.mut((d) => d.customers.push(c));
    this.log('CUSTOMER', name, 'Created a customer account');
    return c;
  }

  registerInstitution(f: { org: string; dept: string; gstin: string; city: string; state: string; type: string; name: string; role: string; phone: string; email: string; pw?: string }): Customer {
    const inst: Institution = {
      id: `i-${Date.now()}`, name: f.org, dept: f.dept, gstin: f.gstin.toUpperCase(), city: f.city, state: f.state, type: f.type, status: 'PENDING', contractPct: 0, creditDays: 0,
      users: [{ name: f.name, role: f.role, email: f.email }], createdAt: new Date().toISOString(),
    };
    const c: Customer = { id: `c-${Date.now()}`, name: f.name, phone: f.phone, email: f.email, pw: f.pw, kind: 'INSTITUTION', institutionId: inst.id, addresses: [] };
    this.mut((d) => { d.institutions.push(inst); d.customers.push(c); });
    this.log('CUSTOMER', f.name, `Registered institution ${f.org} — waiting for approval`);
    return c;
  }

  addTeamUser(name: string, role: string, email: string): void {
    const i = this.institution();
    if (!i) return;
    this.mut((d) => d.institutions.find((x) => x.id === i.id)!.users.push({ name, role, email }));
    this.say(`${name} added to your team`);
  }

  saveAddress(a: Address): void {
    const c = this.customer();
    if (!c) return;
    this.mut((d) => { const x = d.customers.find((y) => y.id === c.id)!; x.addresses = [a, ...x.addresses.filter((y) => y.line1 !== a.line1)].slice(0, 5); });
  }

  // ── quote basket ──
  inBasket(slug: string): number { return this.basket().find((l) => l.slug === slug)?.qty ?? 0; }
  addToBasket(p: Product, qty = 1): void {
    this.basket.update((ls) => upsert(ls, p.slug, qty));
    this.say(`Added ${p.name} to your quote basket`, '/quote');
  }
  setQty(slug: string, qty: number): void { this.basket.update((ls) => setLineQty(ls, slug, qty)); }
  remove(slug: string): void { this.basket.update((ls) => ls.filter((l) => l.slug !== slug)); }
  clearBasket(): void { this.basket.set([]); }

  requestQuote(f: { name: string; org: string; email: string; phone: string; note: string }): Quotation {
    const lines: QuoteLine[] = this.basketItems().map((l) => ({
      slug: l.slug, name: l.product.name, sku: l.product.sku, qty: l.qty, list: l.product.price, offer: this.unitPrice(l.product), gstPct: l.product.gstPct,
    }));
    const q = this.mutRet((d) => {
      const q: Quotation = {
        id: `q-${Date.now()}`, number: `CSQ/${new Date().getFullYear()}/${++d.seq.quote}`, customerId: this.customerId() ?? undefined,
        customerName: f.name, org: f.org, email: f.email, phone: f.phone, institutionId: this.institution()?.id, lines, note: f.note,
        status: 'REQUESTED', freight: 0, createdAt: new Date().toISOString(),
      };
      d.quotes.push(q);
      return q;
    });
    this.log('CUSTOMER', f.name, `Requested quotation ${q.number} (${lines.length} items)`);
    this.clearBasket();
    return q;
  }

  /** basket → cart (items with a price only) */
  moveBasketToCart(): number {
    const ok = this.basketItems().filter((l) => !l.product.enquiryOnly);
    ok.forEach((l) => this.cart.update((c) => upsert(c, l.slug, l.qty)));
    this.basket.update((b) => b.filter((l) => !ok.some((x) => x.slug === l.slug)));
    return ok.length;
  }

  // ── cart ──
  inCart(slug: string): number { return this.cart().find((l) => l.slug === slug)?.qty ?? 0; }
  addToCart(p: Product, qty = 1): void {
    if (p.enquiryOnly) return this.addToBasket(p, qty);
    this.cart.update((ls) => upsert(ls, p.slug, qty));
    this.say(`Added ${p.name} to your cart`, '/cart');
  }
  setCartQty(slug: string, qty: number): void { this.cart.update((ls) => setLineQty(ls, slug, qty)); }
  removeFromCart(slug: string): void { this.cart.update((ls) => ls.filter((l) => l.slug !== slug)); }
  cartToBasket(): void {
    this.cart().forEach((l) => this.basket.update((b) => upsert(b, l.slug, l.qty)));
    this.cart.set([]);
  }

  // ── orders ──
  placeOrder(f: { address: Address; pay: PayMethod; coupon: string; poNumber?: string; poFile?: string }): Order {
    const c = this.customer();
    if (!c) throw new Error('Sign in first');
    const inst = this.institution();
    if (f.pay !== 'ONLINE' && !(inst?.status === 'APPROVED' && inst.creditDays > 0)) throw new Error('Credit is only for approved institutions');
    const lines: OrderLine[] = this.cartItems().map((l) => ({ slug: l.slug, name: l.product.name, sku: l.product.sku, qty: l.qty, unit: l.unit, gstPct: l.product.gstPct, hsn: l.product.hsn }));
    if (!lines.length) throw new Error('Cart is empty');
    const t = this.totals(lines.map((l) => ({ unit: l.unit, qty: l.qty, gstPct: l.gstPct })), f.address.state, f.coupon);
    const o = this.mutRet((d) => {
      const n = ++d.seq.order;
      const now = new Date().toISOString();
      const o: Order = {
        id: `o-${n}`, number: `CSI/${new Date().getFullYear()}/${n}`, customerId: c.id, customerName: c.name, institutionId: inst?.id, institutionName: inst?.name,
        lines, subtotal: t.subtotal, discount: t.discount, coupon: t.discount ? f.coupon.trim().toUpperCase() : undefined, shipping: t.shipping,
        cgst: t.cgst, sgst: t.sgst, igst: t.igst, total: t.total, address: f.address, buyerGstin: inst?.gstin,
        pay: f.pay, paid: false, poNumber: f.poNumber, poFile: f.poFile,
        dueDate: f.pay === 'CREDIT' ? new Date(Date.now() + (inst?.creditDays ?? 0) * 864e5).toISOString() : undefined,
        status: f.pay === 'ONLINE' ? 'PAYMENT_PENDING' : 'PLACED',
        history: [{ status: f.pay === 'ONLINE' ? 'PAYMENT_PENDING' : 'PLACED', at: now, by: c.name }], createdAt: now,
      };
      if (o.discount) d.coupons.find((x) => x.code === o.coupon)!.uses++;
      d.orders.push(o);
      return o;
    });
    this.saveAddress(f.address);
    this.cart.set([]);
    this.log('CUSTOMER', c.name, `Placed order ${o.number} — ${inrPlain(o.total)} (${f.pay === 'ONLINE' ? 'online payment' : f.pay === 'CREDIT' ? `credit, PO ${f.poNumber}` : 'bank transfer'})`);
    return o;
  }

  /** demo payment result */
  paymentResult(orderId: string, ok: boolean, method: string): void {
    this.mut((d) => {
      const o = d.orders.find((x) => x.id === orderId);
      if (!o || o.status !== 'PAYMENT_PENDING') return;
      if (ok) {
        o.paid = true; o.paymentRef = `pay_DEMO${Date.now().toString().slice(-8)}`; o.status = 'PLACED'; o.invoiceNo = `INV/${++d.seq.invoice}`;
        o.history.push({ status: 'PLACED', at: new Date().toISOString(), by: 'Payment gateway', note: `Paid by ${method}` });
      } else {
        o.history.push({ status: 'NOTE', at: new Date().toISOString(), by: 'Payment gateway', note: `Payment by ${method} failed — not charged` });
      }
    });
  }

  cancelOrder(orderId: string, reason: string): void {
    this.mut((d) => {
      const o = d.orders.find((x) => x.id === orderId && x.customerId === this.customerId());
      if (!o || !['PAYMENT_PENDING', 'PLACED', 'CONFIRMED'].includes(o.status)) return;
      o.status = 'CANCELLED';
      o.history.push({ status: 'CANCELLED', at: new Date().toISOString(), by: o.customerName, note: reason + (o.paid ? ' — refund in 5–7 working days' : '') });
    });
    this.say('Order cancelled');
  }

  requestReturn(orderId: string, reason: string): void {
    this.mut((d) => {
      const o = d.orders.find((x) => x.id === orderId && x.customerId === this.customerId());
      if (!o || o.status !== 'DELIVERED') return;
      o.returnRequest = reason;
      o.history.push({ status: 'NOTE', at: new Date().toISOString(), by: o.customerName, note: `Return requested: ${reason}` });
    });
    this.say('Return request sent');
  }

  approveQuote(quoteId: string, po: { number: string; file: string }, pay: PayMethod): Order | null {
    const q = this.db().quotes.find((x) => x.id === quoteId && x.customerId === this.customerId());
    const c = this.customer();
    const inst = this.institution();
    if (!q || !c || q.status !== 'QUOTED') return null;
    if (q.validTill && q.validTill < new Date().toISOString()) return null;
    const lines: OrderLine[] = q.lines.map((l) => {
      const p = this.product(l.slug);
      return { slug: l.slug, name: l.name, sku: l.sku, qty: l.qty, unit: l.offer, gstPct: l.gstPct, hsn: p?.hsn ?? '9027' };
    });
    const addr = c.addresses[0] ?? { name: c.name, line1: inst?.dept ?? '', line2: inst?.name ?? '', city: inst?.city ?? '', state: inst?.state ?? SELLER_STATE, pin: '', phone: c.phone };
    const t = computeTotals(lines, addr.state, 0, q.freight);
    const o = this.mutRet((d) => {
      const n = ++d.seq.order;
      const now = new Date().toISOString();
      const o: Order = {
        id: `o-${n}`, number: `CSI/${new Date().getFullYear()}/${n}`, customerId: c.id, customerName: c.name, institutionId: inst?.id, institutionName: inst?.name,
        lines, ...t, address: addr, buyerGstin: inst?.gstin, pay, paid: false, poNumber: po.number || undefined, poFile: po.file || undefined,
        dueDate: pay === 'CREDIT' ? new Date(Date.now() + (inst?.creditDays ?? 0) * 864e5).toISOString() : undefined,
        status: pay === 'ONLINE' ? 'PAYMENT_PENDING' : 'PLACED', history: [{ status: pay === 'ONLINE' ? 'PAYMENT_PENDING' : 'PLACED', at: now, by: c.name, note: `From quotation ${q.number}` }],
        createdAt: now, fromQuote: q.number,
      };
      d.orders.push(o);
      const qq = d.quotes.find((x) => x.id === quoteId)!;
      qq.status = 'APPROVED'; qq.orderId = o.id;
      return o;
    });
    this.log('CUSTOMER', c.name, `Approved quotation ${q.number} → order ${o.number}${po.number ? ` (PO ${po.number})` : ''}`);
    return o;
  }

  rejectQuote(quoteId: string, reason: string): void {
    this.mut((d) => {
      const q = d.quotes.find((x) => x.id === quoteId && x.customerId === this.customerId());
      if (q && q.status === 'QUOTED') { q.status = 'REJECTED'; q.note = `${q.note ?? ''}\nCustomer: ${reason}`.trim(); }
    });
    this.say('Quotation declined — the sales team has been told');
  }

  // ── admin actions (role checks mirror PERMISSIONS; the real API enforces them) ──
  can(perm: string, perms: Record<string, Role[]>): boolean { const s = this.staff(); return !!s && (perms[perm] ?? []).includes(s.role); }

  adminSetStatus(orderId: string, status: OrderStatus, extra: { courier?: string; tracking?: string; note?: string } = {}): void {
    const s = this.staff();
    this.mut((d) => {
      const o = d.orders.find((x) => x.id === orderId);
      if (!o) return;
      o.status = status;
      if (extra.courier) o.courier = extra.courier;
      if (extra.tracking) o.tracking = extra.tracking;
      if (status === 'CONFIRMED' && !o.invoiceNo) o.invoiceNo = `INV/${++d.seq.invoice}`;
      o.history.push({ status, at: new Date().toISOString(), by: s?.name ?? 'Admin', note: extra.note ?? (extra.tracking ? `${extra.courier} ${extra.tracking}` : undefined) });
    });
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `Order ${this.db().orders.find((o) => o.id === orderId)?.number} → ${status.toLowerCase()}`);
  }

  adminMarkPaid(orderId: string, ref: string): void {
    const s = this.staff();
    this.mut((d) => {
      const o = d.orders.find((x) => x.id === orderId);
      if (!o) return;
      o.paid = true; o.paymentRef = ref;
      o.history.push({ status: 'NOTE', at: new Date().toISOString(), by: s?.name ?? 'Admin', note: `Payment received — ${ref}` });
    });
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `Recorded payment ${ref} for ${this.db().orders.find((o) => o.id === orderId)?.number}`);
  }

  adminSendQuote(quoteId: string, lines: QuoteLine[], freight: number, validDays: number, terms: string): void {
    const s = this.staff();
    this.mut((d) => {
      const q = d.quotes.find((x) => x.id === quoteId);
      if (!q) return;
      q.lines = lines; q.freight = freight; q.terms = terms; q.status = 'QUOTED'; q.quotedAt = new Date().toISOString();
      q.validTill = new Date(Date.now() + validDays * 864e5).toISOString();
    });
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `Sent quotation ${this.db().quotes.find((q) => q.id === quoteId)?.number}`);
  }

  adminInstitution(id: string, patch: Partial<Pick<Institution, 'status' | 'contractPct' | 'creditDays'>>): void {
    const s = this.staff();
    const before = this.db().institutions.find((i) => i.id === id);
    this.mut((d) => Object.assign(d.institutions.find((i) => i.id === id)!, patch));
    const what = patch.status ? `${patch.status === 'APPROVED' ? 'Approved' : 'Rejected'} institution ${before?.name}`
      : `Changed terms for ${before?.name}: contract ${before?.contractPct}% → ${patch.contractPct ?? before?.contractPct}%, credit ${before?.creditDays} → ${patch.creditDays ?? before?.creditDays} days`;
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', what);
  }

  adminProduct(slug: string, patch: { price?: number; stock?: 'in' | 'low' | 'order'; enquiryOnly?: boolean; hidden?: boolean }): void {
    const s = this.staff();
    const p = this.allProducts().find((x) => x.slug === slug);
    const prev = this.product(slug);
    this.mut((d) => { d.overrides[slug] = { ...d.overrides[slug], ...patch }; });
    const parts = Object.entries(patch).map(([k, v]) => k === 'hidden' ? (v ? 'hidden from website' : 'shown on website') : `${k} ${k === 'price' ? `₹${prev?.price} → ₹${v}` : `→ ${v}`}`);
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `${p?.name}: ${parts.join(', ')}`);
  }

  /** create or edit a product with all its details. Returns an error message, or '' when saved. */
  adminSaveProduct(p: Product, isNew: boolean): string {
    const s = this.staff();
    const all = this.allProducts();
    const clean = (v: string, n: number) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
    const d: Product = {
      ...p, name: clean(p.name, 120), brand: clean(p.brand, 60), sku: clean(p.sku, 40).toUpperCase(), hsn: clean(p.hsn, 8), pack: clean(p.pack, 60),
      description: clean(p.description, 1200), price: Math.round(Number(p.price) * 100) / 100, gstPct: Number(p.gstPct),
      specs: p.specs.map(([k, v]) => [clean(k, 60), clean(v, 160)] as [string, string]).filter(([k, v]) => k && v).slice(0, 30),
      images: (p.images ?? []).filter((u) => /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(u) || /^img\/[a-z0-9-]+\.(webp|jpg|png)$/.test(u)).slice(0, 6),
    };
    if (!d.images!.length) delete d.images;
    const bytes = JSON.stringify({ ...this.db(), x: d.images ?? [] }).length;
    if (bytes > 4_500_000) return 'Photo storage for this demo is full. Remove a few photos (the live system stores photos on the server, with no such limit).';
    if (d.name.length < 3) return 'Enter the product name (at least 3 characters).';
    if (!d.category) return 'Choose a category.';
    if (!d.brand) return 'Enter the brand.';
    if (!/^[A-Z0-9][A-Z0-9-]{2,39}$/.test(d.sku)) return 'SKU: 3–40 letters, numbers or dashes.';
    if (all.some((x) => x.sku.toUpperCase() === d.sku && x.slug !== p.slug)) return `SKU ${d.sku} is already used by another product.`;
    if (!Number.isFinite(d.price) || d.price <= 0 || d.price > 10_000_000) return 'Enter a price between ₹1 and ₹1,00,00,000.';
    if (![0, 5, 12, 18, 28].includes(d.gstPct)) return 'GST must be 0, 5, 12, 18 or 28%.';
    if (!/^\d{4,8}$/.test(d.hsn)) return 'HSN code has 4 to 8 digits.';
    if (isNew) {
      let slug = slugify(d.name) || 'product', n = 2;
      while (all.some((x) => x.slug === slug) || PRODUCTS.some((x) => x.slug === slug)) slug = `${slugify(d.name)}-${n++}`;
      d.slug = slug; d.id = `new-${Date.now()}`;
      this.mut((db) => { db.added = [...(db.added ?? []), d]; });
      this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `Added product ${d.name} (${d.sku}) at ₹${d.price}`);
      return '';
    }
    const before = all.find((x) => x.slug === p.slug);
    if (!before) return 'This product no longer exists.';
    const keys: Array<keyof Product> = ['name', 'brand', 'sku', 'category', 'categoryName', 'group', 'icon', 'price', 'gstPct', 'hsn', 'pack', 'stock', 'enquiryOnly', 'description', 'specs', 'images'];
    const changed = keys.filter((k) => JSON.stringify(before[k]) !== JSON.stringify(d[k]));
    if (!changed.length) return '';
    this.mut((db) => {
      const i = (db.added ?? []).findIndex((x) => x.slug === p.slug);
      if (i >= 0) db.added![i] = { ...db.added![i], ...d };
      else { const o: Record<string, unknown> = { ...db.overrides[p.slug] }; for (const k of changed) o[k] = d[k] ?? (k === 'images' ? [] : d[k]); db.overrides[p.slug] = o; }
    });
    const label: Record<string, string> = { categoryName: '', group: '', icon: '', enquiryOnly: 'sold as', gstPct: 'GST', images: 'photos' };
    const what = changed.filter((k) => label[k] !== '').map((k) => k === 'price' ? `price ₹${before.price} → ₹${d.price}` : (label[k] ?? k)).join(', ');
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `Edited product ${d.name}: ${what}`);
    return '';
  }

  adminDeleteProduct(slug: string): void {
    const s = this.staff();
    const p = this.allProducts().find((x) => x.slug === slug);
    if (!p) return;
    this.mut((db) => {
      if ((db.added ?? []).some((x) => x.slug === slug)) db.added = db.added!.filter((x) => x.slug !== slug);
      else db.overrides[slug] = { ...db.overrides[slug], deleted: true };
    });
    this.basket.update((b) => b.filter((l) => l.slug !== slug));
    this.cart.update((c) => c.filter((l) => l.slug !== slug));
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `Deleted product ${p.name} (${p.sku})`);
  }

  adminCoupon(c: Coupon, isNew: boolean): void {
    const s = this.staff();
    this.mut((d) => {
      const i = d.coupons.findIndex((x) => x.code === c.code);
      if (i >= 0) d.coupons[i] = c; else d.coupons.push(c);
    });
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `${isNew ? 'Created' : 'Updated'} coupon ${c.code} (${c.pct}% up to ₹${c.max}, min ₹${c.minOrder}, ${c.active ? 'active' : 'off'})`);
  }

  adminContent(c: DB['content']): void {
    const s = this.staff();
    this.mut((d) => { d.content = c; });
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', 'Updated home page banner');
  }

  adminStaff(id: string, patch: Partial<Staff>): void {
    const s = this.staff();
    const before = this.db().staff.find((x) => x.id === id);
    this.mut((d) => Object.assign(d.staff.find((x) => x.id === id)!, patch));
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `Staff ${before?.name}: ${Object.entries(patch).map(([k, v]) => `${k} → ${v}`).join(', ')}`);
  }

  adminAddStaff(name: string, email: string, role: Role): void {
    const s = this.staff();
    this.mut((d) => d.staff.push({ id: `s${Date.now()}`, name, email, role, active: true }));
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `Added staff ${name} as ${role}`);
  }

  /** CSV import: "sku,price,stock" rows. Returns counts. */
  adminImport(csv: string): { updated: number; skipped: string[] } {
    const skipped: string[] = [];
    let updated = 0;
    const rows = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const [i, row] of rows.entries()) {
      const [sku, priceS, stockS] = row.split(',').map((x) => x.trim());
      if (i === 0 && /sku/i.test(sku)) continue;
      const p = this.allProducts().find((x) => x.sku.toLowerCase() === (sku ?? '').toLowerCase());
      const price = Number(priceS);
      const stock = (stockS ?? '').toLowerCase();
      if (!p) { skipped.push(`Row ${i + 1}: SKU "${sku}" not found`); continue; }
      if (!Number.isFinite(price) || price <= 0 || price > 10_000_000) { skipped.push(`Row ${i + 1}: price "${priceS}" is not a valid amount`); continue; }
      if (stock && !['in', 'low', 'order'].includes(stock)) { skipped.push(`Row ${i + 1}: stock must be in, low or order`); continue; }
      this.mut((d) => { d.overrides[p.slug] = { ...d.overrides[p.slug], price: Math.round(price * 100) / 100, ...(stock ? { stock: stock as 'in' } : {}) }; });
      updated++;
    }
    const s = this.staff();
    this.log(s?.role ?? 'SYSTEM', s?.name ?? 'Admin', `Imported price list: ${updated} updated, ${skipped.length} skipped`);
    return { updated, skipped };
  }

  resetDemo(): void {
    try { ['cs.db.v3', 'cs.basket', 'cs.cart', 'cs.customer', 'cs.staff'].forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
    this.db.set(this.seedWithOrders());
    this.basket.set([]); this.cart.set([]); this.customerId.set(null); this.staffId.set(null);
    this.say('Demo data reset');
  }

  // ── helpers ──
  readonly toastLink = signal<string>('/quote');
  say(msg: string, link = ''): void {
    this.toast.set(msg);
    this.toastLink.set(link);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2800);
  }

  log(role: AuditEntry['role'], who: string, what: string): void {
    this.mut((d) => { d.audit.unshift({ at: new Date().toISOString(), who, role, what }); d.audit = d.audit.slice(0, 300); });
  }

  private mut(fn: (d: DB) => void): void {
    const d = structuredClone(this.db());
    fn(d);
    this.db.set(d);
  }
  private mutRet<T>(fn: (d: DB) => T): T {
    const d = structuredClone(this.db());
    const r = fn(d);
    this.db.set(d);
    return r;
  }
}

function upsert(ls: Line[], slug: string, qty: number): Line[] {
  const q = Math.max(1, Math.min(9999, Math.floor(qty) || 1));
  const i = ls.findIndex((l) => l.slug === slug);
  if (i < 0) return [...ls, { slug, qty: q }];
  const next = [...ls];
  next[i] = { ...next[i], qty: Math.min(9999, next[i].qty + q) };
  return next;
}
function setLineQty(ls: Line[], slug: string, qty: number): Line[] {
  const n = Math.floor(qty);
  const q = Number.isFinite(n) ? Math.min(9999, Math.max(1, n)) : 1; // removing is only by the bin button
  return ls.map((l) => (l.slug === slug ? { ...l, qty: q } : l));
}

/** GST by line rate after a proportional discount; intra-state → CGST + SGST, inter-state → IGST. */
export function computeTotals(lines: Array<{ unit: number; qty: number; gstPct: number }>, state: string, discount: number, freight?: number) {
  const subtotal = r2(lines.reduce((s, l) => s + l.unit * l.qty, 0));
  const disc = Math.min(discount, subtotal);
  const shipping = freight ?? (subtotal - disc >= FREE_SHIPPING_FROM || subtotal === 0 ? 0 : SHIPPING_FEE);
  const factor = subtotal ? (subtotal - disc) / subtotal : 1;
  const tax = r2(lines.reduce((s, l) => s + l.unit * l.qty * factor * (l.gstPct / 100), 0) + shipping * 0.18);
  const intra = state === SELLER_STATE;
  const cgst = intra ? r2(tax / 2) : 0;
  const sgst = intra ? r2(tax - cgst) : 0;
  const igst = intra ? 0 : tax;
  return { subtotal, discount: r2(disc), shipping, cgst, sgst, igst, total: Math.round(subtotal - disc + shipping + tax) };
}

const inrPlain = (n: number) => '₹' + n.toLocaleString('en-IN');
