import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CATEGORIES, PRODUCTS, searchProducts } from '../data/catalog';
import { Coupon, Order, OrderStatus, PERMISSIONS, QuoteLine, ROLE_LABEL, Role } from '../state/models';
import { Store } from '../state/store';
import { Icon } from '../ui/icon';
import { Logo } from '../ui/logo';
import { STATUS_LABEL, dt, dtt, inr } from '../ui/format';

const NAV: Array<[string, string, string]> = [
  ['dashboard', 'Dashboard', 'meter'], ['orders', 'Orders', 'truck'], ['quotations', 'Quotations', 'basket'], ['products', 'Products', 'flask'],
  ['institutions', 'Institutions', 'building'], ['customers', 'Customers', 'user'], ['coupons', 'Coupons', 'certificate'], ['reports', 'Reports', 'balance'],
  ['content', 'Website content', 'slide'], ['staff', 'Staff & roles', 'shield'], ['audit', 'Audit log', 'download'],
];

// ════════════════════ Shell + login ════════════════════
@Component({
  selector: 'cs-admin', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Logo],
  template: `
  @if (!store.staff()) {
    <div class="login">
      <div class="login-box">
        <div class="lb-brand"><cs-logo [size]="40" [wordmark]="false" /><div><b>Chitra Scientific</b><span>Staff admin</span></div></div>
        <h1>Sign in to admin</h1>
        <p class="muted">Demo: choose a staff member. Each role sees only what their job needs — try Store or Accounts to see the limits.</p>
        <div class="who">
          @for (s of staffList(); track s.id) {
            <button type="button" (click)="store.loginStaff(s.id)"><span class="av">{{ s.name.replace('Dr. ', '').charAt(0) }}</span><span><b>{{ s.name }}</b><small>{{ roleLabel[s.role] }}</small></span><cs-icon name="arrow" [size]="18" /></button>
          }
        </div>
        <p class="small muted">Live system: email + password + OTP, sessions expire, every action is logged.</p>
        <a routerLink="/" class="small">← Back to the website</a>
      </div>
    </div>
  } @else {
    <div class="shell">
      <aside class="side">
        <a routerLink="/admin" class="side-brand"><cs-logo [size]="32" [wordmark]="false" /><span><b>Chitra Scientific</b><small>Admin</small></span></a>
        <nav>
          @for (n of nav(); track n[0]) {
            <a [routerLink]="['/admin', n[0]]" routerLinkActive="on"><cs-icon [name]="$any(n[2])" [size]="18" /> {{ n[1] }}
              @if (n[0] === 'quotations' && openQuotes()) { <b class="pill">{{ openQuotes() }}</b> }
              @if (n[0] === 'orders' && newOrders()) { <b class="pill">{{ newOrders() }}</b> }
              @if (n[0] === 'institutions' && pendingInst()) { <b class="pill">{{ pendingInst() }}</b> }
            </a>
          }
        </nav>
        <div class="me">
          <span class="av">{{ store.staff()!.name.replace('Dr. ', '').charAt(0) }}</span>
          <span><b>{{ store.staff()!.name }}</b><small>{{ roleLabel[store.staff()!.role] }}</small></span>
          <button type="button" (click)="out()" aria-label="Sign out"><cs-icon name="close" [size]="16" /></button>
        </div>
        <a routerLink="/" class="side-site">View website</a>
      </aside>
      <section class="main"><router-outlet /></section>
    </div>
  }`,
  styleUrl: './admin.scss',
})
export class AdminShell {
  readonly store = inject(Store);
  private readonly router = inject(Router);
  readonly roleLabel = ROLE_LABEL;
  readonly staffList = computed(() => this.store.db().staff.filter((s) => s.active));
  readonly nav = computed(() => NAV.filter(([k]) => (PERMISSIONS[k] ?? []).includes(this.store.staff()?.role as Role)));
  readonly openQuotes = computed(() => this.store.db().quotes.filter((q) => q.status === 'REQUESTED').length);
  readonly newOrders = computed(() => this.store.db().orders.filter((o) => o.status === 'PLACED').length);
  readonly pendingInst = computed(() => this.store.db().institutions.filter((i) => i.status === 'PENDING').length);
  out(): void { this.store.logoutStaff(); this.router.navigateByUrl('/admin'); }
}

/** shared helpers for admin pages */
abstract class AdminPage {
  readonly store = inject(Store);
  readonly inr = inr; readonly dt = dt; readonly dtt = dtt; readonly S = STATUS_LABEL; readonly roleLabel = ROLE_LABEL;
  can(p: string): boolean { return this.store.can(p, PERMISSIONS); }
  roleName(r: string): string { return (ROLE_LABEL as Record<string, string>)[r] ?? r; }
}

const NoAccess = `<div class="noaccess"><cs-icon name="shield" [size]="34" /><h2>Not available for your role</h2><p>Ask the owner if you need access. (The live system also refuses this on the server.)</p></div>`;

// ════════════════════ Dashboard ════════════════════
@Component({
  selector: 'cs-admin-dash', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink],
  template: `
  <header class="ph"><div><h1>Good {{ greet }}, {{ store.staff()?.name?.split(' ')?.[0] === 'Dr.' ? store.staff()?.name : store.staff()?.name?.split(' ')?.[0] }}</h1><p class="muted">Here is what needs attention today.</p></div></header>
  <div class="kpis">
    <div class="kpi"><span>Sales this month</span><b class="num">{{ inr(monthSales()) }}</b><small>{{ monthOrders() }} {{ monthOrders() === 1 ? 'order' : 'orders' }}</small></div>
    <div class="kpi"><span>Orders to process</span><b class="num">{{ toProcess() }}</b><small><a routerLink="/admin/orders">Open orders</a></small></div>
    <div class="kpi"><span>Quotation requests</span><b class="num">{{ openQuotes() }}</b><small><a routerLink="/admin/quotations">Price them</a></small></div>
    <div class="kpi"><span>Credit outstanding</span><b class="num">{{ inr(credit()) }}</b><small>{{ creditCount() }} {{ creditCount() === 1 ? 'invoice' : 'invoices' }} on PO</small></div>
  </div>
  <div class="grid2">
    <div class="card">
      <h2 class="h3">Sales — last 6 months</h2>
      <svg class="bars" viewBox="0 0 600 220" role="img" [attr.aria-label]="'Monthly sales chart'">
        @for (m of months(); track m.label; let i = $index) {
          <rect [attr.x]="20 + i * 96" [attr.y]="190 - m.h" width="56" [attr.height]="m.h" rx="8" [class.cur]="i === 5"/>
          <text [attr.x]="48 + i * 96" y="210" text-anchor="middle">{{ m.label }}</text>
          <text [attr.x]="48 + i * 96" [attr.y]="182 - m.h" text-anchor="middle" class="v">{{ m.short }}</text>
        }
      </svg>
      <p class="small muted">Includes sample history for the demo; new orders you place in the store add to this month.</p>
    </div>
    <div class="card">
      <h2 class="h3">Needs attention</h2>
      <ul class="todo">
        @for (o of placed(); track o.id) { <li><a routerLink="/admin/orders" [queryParams]="{ id: o.id }"><span class="badge" data-s="PLACED">New order</span> {{ o.number }} · {{ o.institutionName ?? o.customerName }} · {{ inr(o.total) }}</a></li> }
        @for (q of requested(); track q.id) { <li><a routerLink="/admin/quotations" [queryParams]="{ id: q.id }"><span class="badge" data-s="REQUESTED">Quote</span> {{ q.org }} · {{ q.lines.length }} {{ q.lines.length === 1 ? 'item' : 'items' }}</a></li> }
        @for (i of pending(); track i.id) { <li><a routerLink="/admin/institutions"><span class="badge" data-s="PENDING">Approve</span> {{ i.name }}</a></li> }
        @for (p of lowStock(); track p.slug) { <li><a routerLink="/admin/products" [queryParams]="{ q: p.name }"><span class="badge" data-s="CANCELLED">Low stock</span> {{ p.name }}</a></li> }
      </ul>
    </div>
  </div>
  <div class="card">
    <h2 class="h3">Recent activity</h2>
    <ul class="audit">@for (a of store.db().audit.slice(0, 6); track $index) { <li><span class="when">{{ dtt(a.at) }}</span><b>{{ a.who }}</b>&nbsp;<span class="muted">({{ a.role === 'CUSTOMER' ? 'customer' : roleName(a.role) }})</span> — {{ a.what }}</li> }</ul>
  </div>`,
  styleUrl: './admin.scss',
})
export class AdminDash extends AdminPage {
  readonly greet = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
  private readonly orders = computed(() => this.store.db().orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'PAYMENT_PENDING'));
  private readonly thisMonth = computed(() => { const d = new Date(); return this.orders().filter((o) => { const x = new Date(o.createdAt); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); }); });
  readonly monthSales = computed(() => this.thisMonth().reduce((s, o) => s + o.total, 0));
  readonly monthOrders = computed(() => this.thisMonth().length);
  readonly toProcess = computed(() => this.store.db().orders.filter((o) => ['PLACED', 'CONFIRMED', 'PACKED'].includes(o.status)).length);
  readonly openQuotes = computed(() => this.store.db().quotes.filter((q) => q.status === 'REQUESTED').length);
  readonly credit = computed(() => this.orders().filter((o) => o.pay === 'CREDIT' && !o.paid).reduce((s, o) => s + o.total, 0));
  readonly creditCount = computed(() => this.orders().filter((o) => o.pay === 'CREDIT' && !o.paid).length);
  readonly placed = computed(() => this.store.db().orders.filter((o) => o.status === 'PLACED').slice(0, 4));
  readonly requested = computed(() => this.store.db().quotes.filter((q) => q.status === 'REQUESTED').slice(0, 4));
  readonly pending = computed(() => this.store.db().institutions.filter((i) => i.status === 'PENDING'));
  readonly lowStock = computed(() => this.store.products().filter((p) => p.stock === 'low').slice(0, 3));
  readonly months = computed(() => {
    // sample history (labelled in the UI) + real orders placed in this browser for the current month
    const base = [312000, 268000, 401000, 356000, 289000, 0];
    const out = base.map((v, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
      return { label: d.toLocaleDateString('en-IN', { month: 'short' }), v: i === 5 ? this.monthSales() + 148000 : v };
    });
    const max = Math.max(...out.map((m) => m.v), 1);
    return out.map((m) => ({ ...m, h: Math.max(6, Math.round((m.v / max) * 150)), short: '₹' + (m.v / 100000).toFixed(1) + 'L' }));
  });
}

// ════════════════════ Orders ════════════════════
@Component({
  selector: 'cs-admin-orders', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, FormsModule, Icon],
  templateUrl: './admin-orders.html',
  styleUrl: './admin.scss',
})
export class AdminOrders extends AdminPage {
  readonly id = input<string>();
  readonly filter = signal<'all' | 'open' | 'credit' | 'done'>('open');
  readonly q = signal('');
  readonly list = computed(() => {
    const t = this.q().toLowerCase();
    return this.store.db().orders.filter((o) => {
      const f = this.filter();
      if (f === 'open' && !['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'PAYMENT_PENDING'].includes(o.status)) return false;
      if (f === 'credit' && !(o.pay === 'CREDIT' && !o.paid)) return false;
      if (f === 'done' && !['DELIVERED', 'CANCELLED'].includes(o.status)) return false;
      return !t || `${o.number} ${o.customerName} ${o.institutionName ?? ''}`.toLowerCase().includes(t);
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
  readonly sel = signal<string | null>(null);
  readonly cur = computed(() => this.store.db().orders.find((o) => o.id === (this.sel() ?? this.id())) ?? null);
  courier = 'DTDC Courier'; tracking = ''; payRef = ''; err = '';

  next(o: Order): OrderStatus | null { return ({ PLACED: 'CONFIRMED', CONFIRMED: 'PACKED', PACKED: 'SHIPPED', SHIPPED: 'DELIVERED' } as Record<string, OrderStatus>)[o.status] ?? null; }
  advance(o: Order): void {
    const n = this.next(o);
    if (!n) return;
    if (n === 'SHIPPED' && this.tracking.trim().length < 6) { this.err = 'Enter the courier tracking number before marking shipped.'; return; }
    this.err = '';
    this.store.adminSetStatus(o.id, n, n === 'SHIPPED' ? { courier: this.courier, tracking: this.tracking.trim() } : {});
    this.tracking = '';
  }
  paid(o: Order): void {
    if (this.payRef.trim().length < 4) { this.err = 'Enter the bank / UTR reference.'; return; }
    this.err = ''; this.store.adminMarkPaid(o.id, this.payRef.trim()); this.payRef = '';
  }
}

// ════════════════════ Quotations ════════════════════
@Component({
  selector: 'cs-admin-quotes', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, Icon],
  template: `
  @if (!can('quotations')) { ${NoAccess} } @else {
  <header class="ph"><div><h1>Quotations</h1><p class="muted">Price requests from the website, then send the quotation. Customers approve it online.</p></div></header>
  <div class="split">
    <div class="card list-card">
      @for (q of list(); track q.id) {
        <button type="button" class="li" [class.on]="cur()?.id === q.id" (click)="open(q.id)">
          <span><b>{{ q.org }}</b><small>{{ q.number }} · {{ q.lines.length }} {{ q.lines.length === 1 ? 'item' : 'items' }} · {{ dt(q.createdAt) }}</small></span>
          <span class="badge" [attr.data-s]="q.status">{{ S[q.status] }}</span>
        </button>
      }
    </div>
    @if (cur(); as q) {
      <div class="card">
        <div class="row-between"><div><h2 class="h3">{{ q.number }} — {{ q.org }}</h2><p class="small muted">{{ q.customerName }} · {{ q.email }} · {{ q.phone }}</p></div><span class="badge" [attr.data-s]="q.status">{{ S[q.status] }}</span></div>
        @if (q.note) { <p class="note">{{ q.note }}</p> }
        <table class="t">
          <thead><tr><th>Item</th><th class="r">Qty</th><th class="r">List ₹</th><th class="r">Offer ₹</th><th class="r">Amount</th></tr></thead>
          <tbody>
            @for (l of lines; track l.slug; let i = $index) {
              <tr><td>{{ l.name }}<small>{{ l.sku }}</small></td>
                <td class="r"><input class="cell" type="number" min="1" [(ngModel)]="l.qty" [disabled]="!editable()" [attr.aria-label]="'Quantity ' + l.name" /></td>
                <td class="r">{{ inr(l.list) }}</td>
                <td class="r"><input class="cell w" type="number" min="0" step="0.01" [(ngModel)]="l.offer" [disabled]="!editable()" [attr.aria-label]="'Offer price ' + l.name" /></td>
                <td class="r">{{ inr(l.offer * l.qty) }}</td></tr>
            }
          </tbody>
        </table>
        @if (editable()) {
          <div class="tools">
            <label>Discount on all <input class="cell" type="number" min="0" max="40" [(ngModel)]="pct" /> %</label>
            <button class="btn btn-line btn-sm" type="button" (click)="applyPct()">Apply</button>
            <label>Freight ₹ <input class="cell w" type="number" min="0" [(ngModel)]="freight" /></label>
            <label>Valid for <input class="cell" type="number" min="1" max="90" [(ngModel)]="valid" /> days</label>
          </div>
          <div class="field"><label for="qt">Terms</label><textarea id="qt" [(ngModel)]="terms" rows="2"></textarea></div>
          <div class="row-between"><b class="num big">Total {{ inr(total()) }} <small class="muted">incl. GST</small></b>
            <button class="btn btn-primary" type="button" (click)="send()">Send quotation</button></div>
          @if (err) { <p class="err">{{ err }}</p> }
        } @else { <p class="small muted">Sent {{ dtt(q.quotedAt) }}{{ q.validTill ? ' · valid till ' + dt(q.validTill) : '' }}. {{ q.terms }}</p> }
      </div>
    } @else { <div class="card empty">Choose a quotation on the left.</div> }
  </div>
  }`,
  styleUrl: './admin.scss',
})
export class AdminQuotes extends AdminPage {
  readonly id = input<string>();
  readonly list = computed(() => [...this.store.db().quotes].sort((a, b) => (a.status === 'REQUESTED' ? -1 : 0) - (b.status === 'REQUESTED' ? -1 : 0) || b.createdAt.localeCompare(a.createdAt)));
  readonly sel = signal<string | null>(null);
  readonly cur = computed(() => this.store.db().quotes.find((q) => q.id === (this.sel() ?? this.id() ?? this.list()[0]?.id)) ?? null);
  readonly editable = computed(() => this.cur()?.status === 'REQUESTED' && this.can('quotations'));
  lines: QuoteLine[] = []; pct = 10; freight = 0; valid = 15; terms = 'Delivery in 7–10 days from PO. Prices include packing. Installation of instruments included.'; err = '';
  private loadedFor = '';
  readonly total = () => Math.round(this.lines.reduce((s, l) => s + l.offer * l.qty * (1 + l.gstPct / 100), 0) + this.freight * 1.18);

  constructor() {
    super();
    // copy the lines into an editable draft whenever a different quotation is opened
    effect(() => { this.cur(); untracked(() => this.load()); });
  }
  open(id: string): void { this.sel.set(id); }
  load(): void {
    const q = this.cur();
    if (!q || this.loadedFor === q.id) return;
    this.loadedFor = q.id;
    this.lines = q.lines.map((l) => ({ ...l }));
    this.freight = q.freight; this.err = '';
  }
  applyPct(): void {
    const p = Math.min(40, Math.max(0, Number(this.pct) || 0));
    this.lines = this.lines.map((l) => ({ ...l, offer: Math.round(l.list * (1 - p / 100) * 100) / 100 }));
  }
  send(): void {
    const bad = this.lines.find((l) => !(l.qty >= 1) || !(l.offer > 0) || l.offer > l.list * 1.5);
    if (bad) { this.err = `Check ${bad.name}: quantity must be 1 or more and the offer price above zero and not over 150% of list.`; return; }
    const q = this.cur()!;
    this.store.adminSendQuote(q.id, this.lines.map((l) => ({ ...l, qty: Math.floor(l.qty) })), Math.max(0, Number(this.freight) || 0), Math.min(90, Math.max(1, Number(this.valid) || 15)), this.terms.trim());
    this.store.say(`Quotation ${q.number} sent to ${q.email}`);
  }
}

// ════════════════════ Products ════════════════════
@Component({
  selector: 'cs-admin-products', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, Icon, RouterLink],
  template: `
  @if (!can('products')) { ${NoAccess} } @else {
  <header class="ph"><div><h1>Products</h1><p class="muted">{{ store.products().length }} live products · prices and stock update on the website instantly.</p></div>
    @if (can('products.price')) { <button class="btn btn-line btn-sm" type="button" (click)="showImport.set(!showImport())"><cs-icon name="download" [size]="16" /> Import price list</button> }</header>
  @if (showImport()) {
    <div class="card">
      <h2 class="h3">Import from Excel / CSV</h2>
      <p class="small muted">Columns: <code>sku,price,stock</code> (stock = in, low or order). Save your Excel sheet as CSV and paste or upload it.</p>
      <textarea [(ngModel)]="csv" rows="5" placeholder="sku,price,stock&#10;{{ sample }}"></textarea>
      <div class="row-between"><input type="file" accept=".csv,text/csv" (change)="file($event)" /><button class="btn btn-dark btn-sm" type="button" (click)="runImport()">Import</button></div>
      @if (importMsg()) { <p class="small">{{ importMsg() }}</p> }
      @for (s of skipped(); track s) { <p class="err small">{{ s }}</p> }
    </div>
  }
  <div class="filters-row">
    <input type="search" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search name, SKU or brand" aria-label="Search products" />
    <select [ngModel]="cat()" (ngModelChange)="cat.set($event)" aria-label="Category"><option value="">All categories</option>@for (c of cats; track c.slug) { <option [value]="c.slug">{{ c.name }}</option> }</select>
    <select [ngModel]="stock()" (ngModelChange)="stock.set($event)" aria-label="Stock"><option value="">Any stock</option><option value="in">In stock</option><option value="low">Few left</option><option value="order">On order</option></select>
  </div>
  <div class="card flush">
    <table class="t">
      <thead><tr><th>Product</th><th>Category</th><th class="r">Price ₹</th><th>Stock</th><th>Sold as</th><th></th></tr></thead>
      <tbody>
        @for (p of list(); track p.slug) {
          <tr>
            <td><a [routerLink]="['/product', p.slug]" target="_blank">{{ p.name }}</a><small>{{ p.sku }} · {{ p.brand }}</small></td>
            <td class="small">{{ p.categoryName }}</td>
            <td class="r"><input class="cell w" type="number" min="1" [ngModel]="p.price" (change)="price(p.slug, $event)" [disabled]="!can('products.price')" [attr.aria-label]="'Price of ' + p.name" /></td>
            <td><select class="cell-sel" [ngModel]="p.stock" (ngModelChange)="store.adminProduct(p.slug, { stock: $event })" [disabled]="!can('products.stock')" [attr.aria-label]="'Stock of ' + p.name"><option value="in">In stock</option><option value="low">Few left</option><option value="order">On order</option></select></td>
            <td><label class="sw"><input type="checkbox" [checked]="!p.enquiryOnly" (change)="store.adminProduct(p.slug, { enquiryOnly: !$any($event.target).checked })" [disabled]="!can('products.price')" /> {{ p.enquiryOnly ? 'Quote only' : 'Buy online' }}</label></td>
            <td><button class="btn btn-ghost btn-sm" type="button" (click)="store.adminProduct(p.slug, { hidden: true })" [disabled]="!can('products.price')">Hide</button></td>
          </tr>
        }
      </tbody>
    </table>
    @if (all().length > list().length) { <p class="small muted pad">Showing first {{ list().length }} of {{ all().length }} — refine the search.</p> }
  </div>
  }`,
  styleUrl: './admin.scss',
})
export class AdminProducts extends AdminPage {
  readonly qp = input<string>('', { alias: 'q' });
  readonly cats = CATEGORIES;
  readonly q = signal('');
  readonly cat = signal('');
  readonly stock = signal('');
  readonly showImport = signal(false);
  readonly importMsg = signal('');
  readonly skipped = signal<string[]>([]);
  readonly sample = `${PRODUCTS[5].sku},${PRODUCTS[5].price + 50},in`;
  csv = '';
  constructor() { super(); queueMicrotask(() => this.q.set(this.qp() ?? '')); }
  readonly all = computed(() => {
    const base = this.q().trim() ? searchProducts(this.q(), 1000, this.store.products()) : this.store.products();
    return base.filter((p) => (!this.cat() || p.category === this.cat()) && (!this.stock() || p.stock === this.stock()));
  });
  readonly list = computed(() => this.all().slice(0, 60));
  price(slug: string, ev: Event): void {
    const v = Number((ev.target as HTMLInputElement).value);
    if (!Number.isFinite(v) || v <= 0 || v > 10_000_000) { this.store.say('Enter a price above ₹0'); return; }
    this.store.adminProduct(slug, { price: Math.round(v * 100) / 100 });
    this.store.say('Price updated on the website');
  }
  file(ev: Event): void {
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (!f) return;
    if (f.size > 1024 * 1024) { this.importMsg.set('File is larger than 1 MB.'); return; }
    f.text().then((t) => { this.csv = t; this.runImport(); });
  }
  runImport(): void {
    const r = this.store.adminImport(this.csv);
    this.importMsg.set(`${r.updated} products updated, ${r.skipped.length} rows skipped.`);
    this.skipped.set(r.skipped.slice(0, 8));
  }
}

// ════════════════════ Institutions ════════════════════
@Component({
  selector: 'cs-admin-inst', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, Icon],
  template: `
  @if (!can('institutions')) { ${NoAccess} } @else {
  <header class="ph"><div><h1>Institutions</h1><p class="muted">Approve new institution accounts and set their contract discount and credit days.</p></div></header>
  <div class="inst-grid">
    @for (i of list(); track i.id) {
      <div class="card">
        <div class="row-between"><div><h2 class="h3">{{ i.name }}</h2><p class="small muted">{{ i.dept }} · {{ i.city }}, {{ i.state }} · GSTIN {{ i.gstin }}</p></div><span class="badge" [attr.data-s]="i.status">{{ i.status === 'APPROVED' ? 'Approved' : S[i.status] ?? i.status }}</span></div>
        <p class="small">{{ i.type }} · registered {{ dt(i.createdAt) }} · {{ i.users.length }} user{{ i.users.length === 1 ? '' : 's' }}</p>
        <div class="tools">
          <label>Contract discount <input class="cell" type="number" min="0" max="30" #pc [value]="i.contractPct" [disabled]="!can('institutions')" /> %</label>
          <label>Credit <input class="cell" type="number" min="0" max="90" #cd [value]="i.creditDays" [disabled]="!can('institutions')" /> days</label>
          @if (can('institutions')) {
            @if (i.status === 'PENDING') {
              <button class="btn btn-primary btn-sm" type="button" (click)="approve(i.id, +pc.value, +cd.value)">Approve</button>
              <button class="btn btn-ghost btn-sm" type="button" (click)="store.adminInstitution(i.id, { status: 'REJECTED' })">Reject</button>
            } @else {
              <button class="btn btn-line btn-sm" type="button" (click)="save(i.id, +pc.value, +cd.value)">Save terms</button>
            }
          }
        </div>
        @if (err() && errFor() === i.id) { <p class="err small">{{ err() }}</p> }
      </div>
    }
  </div>
  }`,
  styleUrl: './admin.scss',
})
export class AdminInstitutions extends AdminPage {
  readonly list = computed(() => [...this.store.db().institutions].sort((a, b) => (a.status === 'PENDING' ? -1 : 1) - (b.status === 'PENDING' ? -1 : 1)));
  readonly err = signal(''); readonly errFor = signal('');
  private ok(id: string, pct: number, days: number): boolean {
    if (!(pct >= 0 && pct <= 30) || !(days >= 0 && days <= 90)) { this.errFor.set(id); this.err.set('Discount must be 0–30% and credit 0–90 days.'); return false; }
    this.err.set(''); return true;
  }
  approve(id: string, pct: number, days: number): void { if (this.ok(id, pct, days)) { this.store.adminInstitution(id, { status: 'APPROVED', contractPct: pct, creditDays: days }); this.store.say('Institution approved — contract prices are now live for them'); } }
  save(id: string, pct: number, days: number): void { if (this.ok(id, pct, days)) { this.store.adminInstitution(id, { contractPct: pct, creditDays: days }); this.store.say('Terms saved'); } }
}

// ════════════════════ Customers ════════════════════
@Component({
  selector: 'cs-admin-customers', changeDetection: ChangeDetectionStrategy.OnPush, imports: [Icon],
  template: `
  @if (!can('customers')) { ${NoAccess} } @else {
  <header class="ph"><div><h1>Customers</h1><p class="muted">Everyone who has an account, with their order totals.</p></div></header>
  <div class="card flush"><table class="t">
    <thead><tr><th>Name</th><th>Type</th><th>Contact</th><th class="r">Orders</th><th class="r">Total spent</th></tr></thead>
    <tbody>@for (c of rows(); track c.id) { <tr><td><b>{{ c.name }}</b><small>{{ c.org }}</small></td><td>{{ c.kind === 'INSTITUTION' ? 'Institution' : 'Individual' }}</td><td class="small">{{ c.phone }}<br>{{ c.email }}</td><td class="r">{{ c.n }}</td><td class="r">{{ inr(c.total) }}</td></tr> }</tbody>
  </table></div>
  }`,
  styleUrl: './admin.scss',
})
export class AdminCustomers extends AdminPage {
  readonly rows = computed(() => this.store.db().customers.map((c) => {
    const os = this.store.db().orders.filter((o) => o.customerId === c.id && o.status !== 'CANCELLED');
    return { ...c, org: this.store.db().institutions.find((i) => i.id === c.institutionId)?.name ?? '', n: os.length, total: os.reduce((s, o) => s + o.total, 0) };
  }));
}

// ════════════════════ Coupons ════════════════════
@Component({
  selector: 'cs-admin-coupons', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, Icon],
  template: `
  @if (!can('coupons')) { ${NoAccess} } @else {
  <header class="ph"><div><h1>Coupons</h1><p class="muted">Discount codes for individual buyers. Institutions use contract prices instead.</p></div></header>
  <div class="card flush"><table class="t">
    <thead><tr><th>Code</th><th class="r">Discount</th><th class="r">Max</th><th class="r">Min order</th><th class="r">Used</th><th>Status</th></tr></thead>
    <tbody>@for (c of store.db().coupons; track c.code) { <tr><td><b>{{ c.code }}</b></td><td class="r">{{ c.pct }}%</td><td class="r">{{ inr(c.max) }}</td><td class="r">{{ inr(c.minOrder) }}</td><td class="r">{{ c.uses }}</td>
      <td><label class="sw"><input type="checkbox" [checked]="c.active" (change)="toggle(c)" [disabled]="!can('coupons')" /> {{ c.active ? 'Active' : 'Off' }}</label></td></tr> }</tbody>
  </table></div>
  @if (can('coupons')) {
    <form class="card" (ngSubmit)="add()">
      <h2 class="h3">New coupon</h2>
      <div class="tools">
        <label>Code <input class="cell w" type="text" name="c" [(ngModel)]="n.code" maxlength="16" /></label>
        <label>Discount <input class="cell" type="number" name="p" [(ngModel)]="n.pct" min="1" max="50" /> %</label>
        <label>Max ₹ <input class="cell w" type="number" name="m" [(ngModel)]="n.max" min="1" /></label>
        <label>Min order ₹ <input class="cell w" type="number" name="o" [(ngModel)]="n.minOrder" min="0" /></label>
        <button class="btn btn-primary btn-sm" type="submit">Create</button>
      </div>
      @if (err) { <p class="err small">{{ err }}</p> }
    </form>
  }
  }`,
  styleUrl: './admin.scss',
})
export class AdminCoupons extends AdminPage {
  n: Coupon = { code: '', pct: 10, max: 1000, minOrder: 2000, active: true, uses: 0 };
  err = '';
  toggle(c: Coupon): void { this.store.adminCoupon({ ...c, active: !c.active }, false); }
  add(): void {
    const code = this.n.code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,16}$/.test(code)) { this.err = 'Code: 4–16 letters or numbers.'; return; }
    if (this.store.db().coupons.some((c) => c.code === code)) { this.err = 'That code already exists.'; return; }
    if (!(this.n.pct >= 1 && this.n.pct <= 50) || !(this.n.max >= 1) || !(this.n.minOrder >= 0)) { this.err = 'Discount 1–50%, max above ₹0, minimum order ₹0 or more.'; return; }
    this.err = '';
    this.store.adminCoupon({ ...this.n, code, uses: 0 }, true);
    this.n = { code: '', pct: 10, max: 1000, minOrder: 2000, active: true, uses: 0 };
  }
}

// ════════════════════ Reports ════════════════════
@Component({
  selector: 'cs-admin-reports', changeDetection: ChangeDetectionStrategy.OnPush, imports: [Icon],
  template: `
  @if (!can('reports')) { ${NoAccess} } @else {
  <header class="ph"><div><h1>Reports</h1><p class="muted">From orders in this demo. Export any table to Excel (CSV).</p></div></header>
  <div class="grid2">
    <div class="card"><div class="row-between"><h2 class="h3">Sales by category</h2><button class="btn btn-ghost btn-sm" type="button" (click)="csv('sales-by-category', byCat())"><cs-icon name="download" [size]="16" /> CSV</button></div>
      <div class="hbars">@for (r of byCat(); track r[0]) { <div class="hb"><span>{{ r[0] }}</span><div class="track"><i [style.width.%]="r[2]"></i></div><b class="num">{{ inr(+r[1]) }}</b></div> }</div></div>
    <div class="card"><div class="row-between"><h2 class="h3">Top products</h2><button class="btn btn-ghost btn-sm" type="button" (click)="csv('top-products', top())"><cs-icon name="download" [size]="16" /> CSV</button></div>
      <ol class="toplist">@for (r of top(); track r[0]) { <li><span>{{ r[0] }}</span><b class="num">{{ r[1] }} sold</b></li> }</ol></div>
  </div>
  <div class="card"><div class="row-between"><h2 class="h3">GST summary (for filing)</h2><button class="btn btn-ghost btn-sm" type="button" (click)="csv('gst-summary', gst())"><cs-icon name="download" [size]="16" /> CSV</button></div>
    <table class="t"><thead><tr><th>Month</th><th class="r">Taxable</th><th class="r">CGST</th><th class="r">SGST</th><th class="r">IGST</th><th class="r">Invoices</th></tr></thead>
      <tbody>@for (r of gst(); track r[0]) { <tr><td>{{ r[0] }}</td><td class="r">{{ inr(+r[1]) }}</td><td class="r">{{ inr(+r[2]) }}</td><td class="r">{{ inr(+r[3]) }}</td><td class="r">{{ inr(+r[4]) }}</td><td class="r">{{ r[5] }}</td></tr> }</tbody></table></div>
  }`,
  styleUrl: './admin.scss',
})
export class AdminReports extends AdminPage {
  private readonly orders = computed(() => this.store.db().orders.filter((o) => o.invoiceNo && o.status !== 'CANCELLED'));
  readonly byCat = computed(() => {
    const m = new Map<string, number>();
    for (const o of this.orders()) for (const l of o.lines) { const c = PRODUCTS.find((p) => p.slug === l.slug)?.categoryName ?? 'Other'; m.set(c, (m.get(c) ?? 0) + l.unit * l.qty); }
    const rows = [...m.entries()].sort((a, b) => b[1] - a[1]);
    const max = Math.max(...rows.map((r) => r[1]), 1);
    return rows.map(([k, v]) => [k, String(Math.round(v)), String(Math.round((v / max) * 100))] as [string, string, string]);
  });
  readonly top = computed(() => {
    const m = new Map<string, number>();
    for (const o of this.orders()) for (const l of o.lines) m.set(l.name, (m.get(l.name) ?? 0) + l.qty);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => [k, String(v)]);
  });
  readonly gst = computed(() => {
    const m = new Map<string, number[]>();
    for (const o of this.orders()) {
      const k = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      const r = m.get(k) ?? [0, 0, 0, 0, 0];
      r[0] += o.subtotal - o.discount + o.shipping; r[1] += o.cgst; r[2] += o.sgst; r[3] += o.igst; r[4]++;
      m.set(k, r);
    }
    return [...m.entries()].map(([k, r]) => [k, ...r.map((x, i) => (i === 4 ? String(x) : String(Math.round(x * 100) / 100)))]);
  });
  csv(name: string, rows: string[][]): void {
    // values are quoted and formula-leading characters neutralised so the file is safe to open in Excel
    const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? "'" + v : v).replace(/"/g, '""')}"`;
    const blob = new Blob([rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `${name}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
}

// ════════════════════ Content ════════════════════
@Component({
  selector: 'cs-admin-content', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, Icon],
  template: `
  @if (!can('content')) { ${NoAccess} } @else {
  <header class="ph"><div><h1>Website content</h1><p class="muted">Change the announcement bar without a developer. Certificates, pages and banners work the same way in the live system.</p></div></header>
  <form class="card narrow" (ngSubmit)="save()">
    <div class="field"><label for="b">Announcement bar text</label><input id="b" type="text" name="b" [(ngModel)]="c.banner" maxlength="140" /><span class="hint">{{ c.banner.length }}/140 characters · plain text only</span></div>
    <label class="sw"><input type="checkbox" name="on" [(ngModel)]="c.bannerOn" /> Show on the website</label>
    <div class="row-between" style="margin-top:14px"><span></span><button class="btn btn-primary" type="submit">Publish</button></div>
  </form>
  }`,
  styleUrl: './admin.scss',
})
export class AdminContent extends AdminPage {
  c = { ...this.store.db().content };
  save(): void { this.store.adminContent({ ...this.c, banner: this.c.banner.replace(/[<>]/g, '').trim() }); this.store.say('Published to the website'); }
}

// ════════════════════ Staff & roles ════════════════════
@Component({
  selector: 'cs-admin-staff', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, Icon],
  template: `
  @if (!can('staff')) { ${NoAccess} } @else {
  <header class="ph"><div><h1>Staff &amp; roles</h1><p class="muted">Who can sign in to admin, and what each role can do.</p></div></header>
  <div class="grid2">
    <div class="card flush"><table class="t"><thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
      <tbody>@for (s of store.db().staff; track s.id) { <tr><td><b>{{ s.name }}</b><small>{{ s.email }}</small></td>
        <td><select class="cell-sel" [ngModel]="s.role" (ngModelChange)="store.adminStaff(s.id, { role: $event })" [disabled]="s.id === store.staff()?.id" [attr.aria-label]="'Role of ' + s.name">@for (r of roles; track r) { <option [value]="r">{{ roleLabel[r] }}</option> }</select></td>
        <td><label class="sw"><input type="checkbox" [checked]="s.active" (change)="store.adminStaff(s.id, { active: !s.active })" [disabled]="s.id === store.staff()?.id" /> {{ s.active ? 'Active' : 'Disabled' }}</label></td></tr> }</tbody></table>
      <form class="pad tools" (ngSubmit)="add()">
        <input class="cell w" type="text" name="n" [(ngModel)]="n.name" placeholder="Name" aria-label="Name" />
        <input class="cell w" type="email" name="e" [(ngModel)]="n.email" placeholder="Email" aria-label="Email" />
        <select class="cell-sel" name="r" [(ngModel)]="n.role" aria-label="Role">@for (r of roles; track r) { <option [value]="r">{{ roleLabel[r] }}</option> }</select>
        <button class="btn btn-dark btn-sm" type="submit">Add staff</button>
      </form>
      @if (err) { <p class="err small pad">{{ err }}</p> }
    </div>
    <div class="card"><h2 class="h3">What each role can do</h2>
      <table class="t matrix"><thead><tr><th></th>@for (r of roles; track r) { <th>{{ roleLabel[r] }}</th> }</tr></thead>
        <tbody>@for (p of perms; track p[0]) { <tr><td>{{ p[1] }}</td>@for (r of roles; track r) { <td class="c">@if (has(p[0], r)) { <cs-icon name="check" [size]="16" /> }</td> }</tr> }</tbody></table></div>
  </div>
  }`,
  styleUrl: './admin.scss',
})
export class AdminStaff extends AdminPage {
  readonly roles: Role[] = ['OWNER', 'SALES', 'STORE', 'ACCOUNTS'];
  readonly perms: Array<[string, string]> = [['orders.status', 'Pack & ship orders'], ['orders.payment', 'Record payments'], ['quotations', 'Send quotations'], ['products.price', 'Change prices'], ['products.stock', 'Change stock'],
    ['institutions', 'Approve institutions & terms'], ['coupons', 'Coupons'], ['reports', 'Reports & GST'], ['content', 'Website content'], ['staff', 'Staff & roles'], ['audit', 'Audit log']];
  n = { name: '', email: '', role: 'SALES' as Role };
  err = '';
  has(p: string, r: Role): boolean { return (PERMISSIONS[p] ?? []).includes(r); }
  add(): void {
    if (this.n.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.n.email.trim())) { this.err = 'Enter a name and a valid email.'; return; }
    this.err = ''; this.store.adminAddStaff(this.n.name.trim(), this.n.email.trim(), this.n.role); this.n = { name: '', email: '', role: 'SALES' };
  }
}

// ════════════════════ Audit ════════════════════
@Component({
  selector: 'cs-admin-audit', changeDetection: ChangeDetectionStrategy.OnPush, imports: [Icon],
  template: `
  @if (!can('audit')) { ${NoAccess} } @else {
  <header class="ph"><div><h1>Audit log</h1><p class="muted">Every change to prices, orders, institutions, coupons and staff — who did it and when. Entries cannot be edited.</p></div></header>
  <div class="card flush"><table class="t"><thead><tr><th>When</th><th>Who</th><th>What</th></tr></thead>
    <tbody>@for (a of store.db().audit; track $index) { <tr><td class="small nowrap">{{ dtt(a.at) }}</td><td><b>{{ a.who }}</b><small>{{ a.role === 'CUSTOMER' ? 'Customer' : roleName(a.role) }}</small></td><td>{{ a.what }}</td></tr> }</tbody></table></div>
  }`,
  styleUrl: './admin.scss',
})
export class AdminAudit extends AdminPage {}
