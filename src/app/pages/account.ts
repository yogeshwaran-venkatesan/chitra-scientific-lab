import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { COMPANY } from '../data/company';
import { Order, PayMethod, SELLER_GSTIN } from '../state/models';
import { Store, passwordProblem } from '../state/store';
import { Icon } from '../ui/icon';
import { EMAIL, STATUS_LABEL, dt, dtt, inr, rupeesInWords } from '../ui/format';

const STEPS = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'] as const;

// ════════════════════ Account (tabs) ════════════════════
@Component({
  selector: 'cs-account', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, FormsModule, Icon],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  readonly store = inject(Store);
  private readonly router = inject(Router);
  readonly tab = input<string>('orders');
  readonly inr = inr; readonly dt = dt; readonly S = STATUS_LABEL;
  readonly tabs = computed(() => [
    ['orders', 'Orders'], ['quotations', 'Quotations'], ['addresses', 'Addresses'],
    ...(this.store.institution() ? [['team', 'Institution & team']] : []), ['profile', 'Profile'],
  ]);
  readonly creditDue = computed(() => this.store.myOrders().filter((o) => o.pay === 'CREDIT' && !o.paid && o.status !== 'CANCELLED').reduce((s, o) => s + o.total, 0));
  member = { name: '', role: '', email: '' };
  pw = { cur: '', next: '', next2: '' };
  readonly pwMsg = signal('');
  readonly pwOk = signal(false);
  async changePw(): Promise<void> {
    const c = this.store.customer(); if (!c) return;
    this.pwOk.set(false);
    if (!(await this.store.checkPassword(c.email, this.pw.cur))) return this.pwMsg.set('Current password is not right.');
    const bad = passwordProblem(this.pw.next, c.email);
    if (bad) return this.pwMsg.set(bad);
    if (this.pw.next !== this.pw.next2) return this.pwMsg.set('The two new passwords do not match.');
    if (this.pw.next === this.pw.cur) return this.pwMsg.set('Choose a password different from the current one.');
    await this.store.setPassword(c.id, this.pw.next);
    this.pw = { cur: '', next: '', next2: '' };
    this.pwOk.set(true); this.pwMsg.set('Password updated. (Live site: other signed-in devices are signed out and you get an email.)');
  }
  memberErr = '';

  addMember(): void {
    if (this.member.name.trim().length < 2 || !EMAIL.test(this.member.email.trim())) { this.memberErr = 'Enter a name and a valid email.'; return; }
    this.store.addTeamUser(this.member.name.trim(), this.member.role.trim() || 'Buyer', this.member.email.trim());
    this.member = { name: '', role: '', email: '' }; this.memberErr = '';
  }
  logout(): void { this.store.logoutCustomer(); this.router.navigateByUrl('/'); }
}

// ════════════════════ Order detail + tracking ════════════════════
@Component({
  selector: 'cs-order', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, FormsModule, Icon],
  template: `
  @if (o(); as o) {
    <div class="wrap page-head"><nav class="crumbs"><a routerLink="/account">My account</a> / <a routerLink="/account/orders">Orders</a> / <span>{{ o.number }}</span></nav>
      @if (isNew()) { <div class="panel thanks"><cs-icon name="check" [size]="30" /><div><b>Thank you — order {{ o.number }} is placed.</b><span>We have emailed a confirmation. Track it here any time.</span></div></div> }
      <h1>Order {{ o.number }}</h1>
      <p class="muted">Placed {{ dtt(o.createdAt) }}{{ o.fromQuote ? ' from quotation ' + o.fromQuote : '' }} · <span class="badge" [attr.data-s]="o.status">{{ S[o.status] }}</span></p>
    </div>
    <div class="wrap grid2">
      <div>
        @if (o.status !== 'CANCELLED' && o.status !== 'PAYMENT_PENDING') {
          <ol class="track">
            @for (s of steps; track s; let i = $index) {
              <li [class.done]="i <= stepIdx()" [class.now]="i === stepIdx()"><span class="dot"></span><b>{{ S[s] }}</b>
                @if (when(s); as w) { <small>{{ w }}</small> }</li>
            }
          </ol>
        }
        @if (o.tracking) { <p class="panel ship"><cs-icon name="truck" [size]="22" /> {{ o.courier }} · tracking number <b>{{ o.tracking }}</b></p> }
        @if (o.status === 'PAYMENT_PENDING') { <div class="panel warn"><b>Payment not completed.</b> <a class="btn btn-primary btn-sm" [routerLink]="['/pay', o.id]">Pay {{ inr(o.total) }}</a></div> }

        <table class="lines">
          <thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
          <tbody>@for (l of o.lines; track l.slug) { <tr><td><a [routerLink]="['/product', l.slug]">{{ l.name }}</a><small>{{ l.sku }}</small></td><td class="r">{{ l.qty }}</td><td class="r">{{ inr(l.unit) }}</td><td class="r">{{ inr(l.unit * l.qty) }}</td></tr> }</tbody>
        </table>

        <h2 class="h3">History</h2>
        <ul class="hist">@for (h of o.history.slice().reverse(); track $index) { <li><b>{{ S[h.status] }}</b> · {{ dtt(h.at) }} · {{ h.by }}@if (h.note) { <br><span class="muted">{{ h.note }}</span> }</li> }</ul>
      </div>
      <aside class="panel side">
        <dl>
          <dt>Items</dt><dd>{{ inr(o.subtotal) }}</dd>
          @if (o.discount) { <dt>Coupon {{ o.coupon }}</dt><dd>− {{ inr(o.discount) }}</dd> }
          <dt>Delivery</dt><dd>{{ o.shipping ? inr(o.shipping) : 'Free' }}</dd>
          @if (o.igst) { <dt>IGST</dt><dd>{{ inr(o.igst) }}</dd> } @else { <dt>CGST</dt><dd>{{ inr(o.cgst) }}</dd><dt>SGST</dt><dd>{{ inr(o.sgst) }}</dd> }
          <dt class="tot">Total</dt><dd class="tot">{{ inr(o.total) }}</dd>
        </dl>
        <p class="small"><b>Payment:</b> {{ o.pay === 'ONLINE' ? 'Online' : o.pay === 'CREDIT' ? 'Credit against PO ' + o.poNumber : 'Bank transfer' }} — {{ o.paid ? 'paid' : o.pay === 'CREDIT' ? 'due ' + dt(o.dueDate) : 'not paid yet' }}</p>
        @if (o.poFile) { <p class="small"><b>PO file:</b> {{ o.poFile }}</p> }
        <p class="small"><b>Deliver to:</b><br>{{ o.address.name }}<br>{{ o.address.line1 }}@if (o.address.line2) {, {{ o.address.line2 }}}<br>{{ o.address.city }}, {{ o.address.state }} {{ o.address.pin }}</p>
        @if (o.invoiceNo) { <a class="btn btn-line full" [routerLink]="['/invoice', o.id]"><cs-icon name="download" [size]="18" /> GST invoice {{ o.invoiceNo }}</a> }
        @if (canCancel()) {
          @if (!cancelling()) { <button class="btn btn-ghost full" type="button" (click)="cancelling.set(true)">Cancel order</button> }
          @else { <div class="field"><label for="cr">Reason</label><select id="cr" [(ngModel)]="reason"><option>Ordered by mistake</option><option>Found a better price</option><option>Need different specification</option><option>Delivery too late</option></select></div>
            <button class="btn btn-dark full" type="button" (click)="store.cancelOrder(o.id, reason); cancelling.set(false)">Confirm cancellation</button> }
        }
        @if (o.status === 'DELIVERED' && !o.returnRequest) {
          @if (!returning()) { <button class="btn btn-ghost full" type="button" (click)="returning.set(true)">Return or report a problem</button> }
          @else { <div class="field"><label for="rr">What went wrong?</label><select id="rr" [(ngModel)]="reason"><option>Item damaged in transit</option><option>Wrong item received</option><option>Not working</option><option>Short supply</option></select></div>
            <button class="btn btn-dark full" type="button" (click)="store.requestReturn(o.id, reason); returning.set(false)">Send return request</button> }
        }
        @if (o.returnRequest) { <p class="small good">Return requested: {{ o.returnRequest }}. Our team will call you.</p> }
      </aside>
    </div>
  } @else { <div class="wrap page-head"><h1>Order not found</h1><p>This order is not in your account. <a routerLink="/account/orders">See your orders</a>.</p></div> }`,
  styleUrl: './account.scss',
})
export class OrderDetail {
  readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  readonly id = input.required<string>();
  readonly isNew = toSignal(this.route.queryParamMap.pipe(map((m) => m.get('new') === '1')), { initialValue: false });
  readonly o = computed(() => this.store.myOrders().find((x) => x.id === this.id()));
  readonly steps = STEPS; readonly S = STATUS_LABEL; readonly inr = inr; readonly dt = dt; readonly dtt = dtt;
  readonly stepIdx = computed(() => STEPS.indexOf((this.o()?.status ?? 'PLACED') as (typeof STEPS)[number]));
  readonly canCancel = computed(() => ['PAYMENT_PENDING', 'PLACED', 'CONFIRMED'].includes(this.o()?.status ?? ''));
  readonly cancelling = signal(false);
  readonly returning = signal(false);
  reason = 'Ordered by mistake';
  when(s: string): string { const h = this.o()?.history.find((x) => x.status === s); return h ? dtt(h.at) : ''; }
}

// ════════════════════ Quotation detail (approve with PO / decline) ════════════════════
@Component({
  selector: 'cs-quotation', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, FormsModule, Icon],
  template: `
  @if (q(); as q) {
    <div class="wrap page-head no-print"><nav class="crumbs"><a routerLink="/account">My account</a> / <a routerLink="/account/quotations">Quotations</a> / <span>{{ q.number }}</span></nav></div>
    <div class="wrap grid2">
      <article class="doc">
        <header class="doc-head"><div><b class="doc-co">{{ co.name }}</b><span>{{ co.address.join(', ') }}</span><span>GSTIN {{ gstin }} · {{ co.phones[0] }}</span></div>
          <div class="doc-title"><b>QUOTATION</b><span>{{ q.number }}</span><span>Date {{ dt(q.quotedAt ?? q.createdAt) }}</span>@if (q.validTill) { <span>Valid till {{ dt(q.validTill) }}</span> }</div></header>
        <p><b>To:</b> {{ q.org }}<br>Attn: {{ q.customerName }} · {{ q.email }}</p>
        <table class="lines">
          <thead><tr><th>#</th><th>Item</th><th class="r">Qty</th><th class="r">List</th><th class="r">Offer</th><th class="r">Amount</th></tr></thead>
          <tbody>@for (l of q.lines; track l.slug; let i = $index) { <tr><td>{{ i + 1 }}</td><td>{{ l.name }}<small>{{ l.sku }} · GST {{ l.gstPct }}%</small></td><td class="r">{{ l.qty }}</td><td class="r"><s>{{ l.list !== l.offer ? inr(l.list) : '' }}</s></td><td class="r">{{ q.status === 'REQUESTED' ? '—' : inr(l.offer) }}</td><td class="r">{{ q.status === 'REQUESTED' ? '—' : inr(l.offer * l.qty) }}</td></tr> }</tbody>
        </table>
        @if (q.status !== 'REQUESTED') {
          <dl class="qsum"><dt>Sub-total</dt><dd>{{ inr(sub()) }}</dd><dt>Freight</dt><dd>{{ q.freight ? inr(q.freight) : 'Included' }}</dd><dt>GST</dt><dd>{{ inr(gst()) }}</dd><dt class="tot">Total</dt><dd class="tot">{{ inr(sub() + q.freight + gst()) }}</dd></dl>
          <p class="small">{{ words() }}</p>
          @if (q.terms) { <p class="small"><b>Terms:</b> {{ q.terms }}</p> }
        } @else { <p class="panel warn">Our sales team is preparing prices for this request. You'll get an email and a WhatsApp message when the quotation is ready.</p> }
        @if (q.note) { <p class="small muted"><b>Your note:</b> {{ q.note }}</p> }
      </article>
      <aside class="panel side no-print">
        <span class="badge" [attr.data-s]="q.status">{{ S[q.status] }}</span>
        @if (q.status === 'QUOTED') {
          @if (expired()) { <p class="err">This quotation expired on {{ dt(q.validTill) }}. Ask us to revalidate it.</p> }
          @else {
            <h2 class="h3">Approve and order</h2>
            @if (canCredit()) {
              <label class="opt"><input type="radio" name="p" [checked]="pay() === 'CREDIT'" (change)="pay.set('CREDIT')" /> Credit {{ store.institution()!.creditDays }} days against PO</label>
              <label class="opt"><input type="radio" name="p" [checked]="pay() === 'BANK'" (change)="pay.set('BANK')" /> Bank transfer before dispatch</label>
            }
            <label class="opt"><input type="radio" name="p" [checked]="pay() === 'ONLINE'" (change)="pay.set('ONLINE')" /> Pay online now</label>
            @if (pay() === 'CREDIT') {
              <div class="field"><label for="pn">PO number</label><input id="pn" type="text" [(ngModel)]="poNo" maxlength="40" /></div>
              <div class="field"><label for="pf">PO document</label><input id="pf" type="file" accept=".pdf,image/*" (change)="file($event)" />@if (poFile) { <span class="hint">Attached: {{ poFile }}</span> }</div>
            }
            @if (err()) { <p class="err">{{ err() }}</p> }
            <button class="btn btn-primary full" type="button" (click)="approve()">Approve quotation</button>
            <button class="btn btn-ghost full" type="button" (click)="declining.set(!declining())">Decline</button>
            @if (declining()) { <div class="field"><label for="dr">Reason</label><input id="dr" type="text" [(ngModel)]="why" maxlength="200" placeholder="e.g. budget not approved this term" /></div>
              <button class="btn btn-dark full" type="button" (click)="store.rejectQuote(q.id, why || 'No reason given')">Send decline</button> }
          }
        }
        @if (q.orderId) { <a class="btn btn-line full" [routerLink]="['/account/orders', q.orderId]">View the order</a> }
        <button class="btn btn-line full" type="button" (click)="print()"><cs-icon name="download" [size]="18" /> Print / save as PDF</button>
      </aside>
    </div>
  } @else { <div class="wrap page-head"><h1>Quotation not found</h1><p><a routerLink="/account/quotations">See your quotations</a></p></div> }`,
  styleUrl: './account.scss',
})
export class QuotationDetail {
  readonly store = inject(Store);
  private readonly router = inject(Router);
  readonly id = input.required<string>();
  readonly co = COMPANY; readonly gstin = SELLER_GSTIN; readonly S = STATUS_LABEL; readonly inr = inr; readonly dt = dt;
  readonly q = computed(() => this.store.myQuotes().find((x) => x.id === this.id()));
  readonly sub = computed(() => (this.q()?.lines ?? []).reduce((s, l) => s + l.offer * l.qty, 0));
  readonly gst = computed(() => Math.round((this.q()?.lines ?? []).reduce((s, l) => s + l.offer * l.qty * l.gstPct / 100, 0) + (this.q()?.freight ?? 0) * 0.18));
  readonly words = computed(() => rupeesInWords(this.sub() + (this.q()?.freight ?? 0) + this.gst()));
  readonly expired = computed(() => !!this.q()?.validTill && this.q()!.validTill! < new Date().toISOString());
  readonly canCredit = computed(() => this.store.institution()?.status === 'APPROVED' && (this.store.institution()?.creditDays ?? 0) > 0);
  readonly pay = signal<PayMethod>(this.canCredit() ? 'CREDIT' : 'ONLINE');
  readonly err = signal('');
  readonly declining = signal(false);
  poNo = ''; poFile = ''; why = '';
  file(ev: Event): void {
    const f = (ev.target as HTMLInputElement).files?.[0];
    this.poFile = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024 || !/^(application\/pdf|image\/(png|jpeg|webp))$/.test(f.type)) { this.err.set('Upload the PO as PDF, PNG or JPG up to 5 MB.'); return; }
    this.err.set(''); this.poFile = f.name.slice(0, 80);
  }
  approve(): void {
    if (this.pay() === 'CREDIT' && (!this.poNo.trim() || !this.poFile)) { this.err.set('Enter the PO number and attach the PO document.'); return; }
    const o: Order | null = this.store.approveQuote(this.id(), { number: this.poNo.trim(), file: this.poFile }, this.pay());
    if (!o) { this.err.set('This quotation can no longer be approved. Please contact us.'); return; }
    this.router.navigateByUrl(o.status === 'PAYMENT_PENDING' ? `/pay/${o.id}` : `/account/orders/${o.id}?new=1`);
  }
  print(): void { window.print(); }
}

// ════════════════════ GST tax invoice (print view) ════════════════════
@Component({
  selector: 'cs-invoice', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, Icon],
  template: `
  @if (o(); as o) {
    <div class="wrap no-print bar"><a [routerLink]="back()">Back</a><button class="btn btn-dark btn-sm" type="button" (click)="print()"><cs-icon name="download" [size]="16" /> Print / save as PDF</button></div>
    <article class="wrap doc invoice">
      <header class="doc-head"><div><b class="doc-co">{{ co.name }}</b><span>{{ co.address.join(', ') }}</span><span>GSTIN {{ gstin }} · State: Tamil Nadu (33)</span><span>{{ co.phones[0] }} · {{ co.emails[0] }}</span></div>
        <div class="doc-title"><b>TAX INVOICE</b><span>{{ o.invoiceNo }}</span><span>Date {{ dt(o.createdAt) }}</span><span>Order {{ o.number }}</span></div></header>
      <div class="parties">
        <div><b>Bill to</b><br>{{ o.institutionName ?? o.customerName }}<br>{{ o.address.line1 }}<br>{{ o.address.city }}, {{ o.address.state }} {{ o.address.pin }}<br>GSTIN: {{ o.buyerGstin ?? 'Unregistered' }}</div>
        <div><b>Ship to</b><br>{{ o.address.name }}<br>{{ o.address.line1 }}@if (o.address.line2) {<br>{{ o.address.line2 }}}<br>{{ o.address.city }}, {{ o.address.state }} {{ o.address.pin }}<br>Ph {{ o.address.phone }}</div>
        <div><b>Place of supply</b><br>{{ o.address.state }}<br><b>Payment</b><br>{{ o.pay === 'CREDIT' ? 'Credit — PO ' + o.poNumber + ', due ' + dt(o.dueDate) : o.paid ? 'Paid online (' + o.paymentRef + ')' : 'Bank transfer' }}</div>
      </div>
      <table class="lines">
        <thead><tr><th>#</th><th>Description</th><th>HSN</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Taxable</th><th class="r">GST %</th></tr></thead>
        <tbody>
          @for (l of o.lines; track l.slug; let i = $index) { <tr><td>{{ i + 1 }}</td><td>{{ l.name }}<small>{{ l.sku }}</small></td><td>{{ l.hsn }}</td><td class="r">{{ l.qty }}</td><td class="r">{{ inr(l.unit) }}</td><td class="r">{{ inr(l.unit * l.qty) }}</td><td class="r">{{ l.gstPct }}</td></tr> }
          @if (o.shipping) { <tr><td></td><td>Freight &amp; handling</td><td>9965</td><td class="r">1</td><td class="r">{{ inr(o.shipping) }}</td><td class="r">{{ inr(o.shipping) }}</td><td class="r">18</td></tr> }
        </tbody>
      </table>
      <dl class="qsum">
        <dt>Taxable value</dt><dd>{{ inr(o.subtotal - o.discount + o.shipping) }}</dd>
        @if (o.discount) { <dt>Includes coupon discount</dt><dd>− {{ inr(o.discount) }}</dd> }
        @if (o.igst) { <dt>IGST</dt><dd>{{ inr(o.igst) }}</dd> } @else { <dt>CGST</dt><dd>{{ inr(o.cgst) }}</dd><dt>SGST</dt><dd>{{ inr(o.sgst) }}</dd> }
        <dt class="tot">Invoice total</dt><dd class="tot">{{ inr(o.total) }}</dd>
      </dl>
      <p class="small">{{ words() }}</p>
      <footer class="doc-foot"><span class="small muted">Prototype invoice — sample GSTIN. Goods once sold are subject to the return policy. Subject to Chennai jurisdiction.</span><span>For {{ co.name }}<br><br>Authorised signatory</span></footer>
    </article>
  } @else { <div class="wrap page-head"><h1>Invoice not found</h1><p><a routerLink="/account/orders">See your orders</a></p></div> }`,
  styleUrl: './account.scss',
})
export class Invoice {
  readonly store = inject(Store);
  readonly id = input.required<string>();
  readonly co = COMPANY; readonly gstin = SELLER_GSTIN; readonly inr = inr; readonly dt = dt;
  /** customers see their own invoices; signed-in staff can open any */
  readonly o = computed(() => this.store.db().orders.find((x) => x.id === this.id() && x.invoiceNo && (x.customerId === this.store.customerId() || !!this.store.staff())));
  readonly words = computed(() => rupeesInWords(this.o()?.total ?? 0));
  back(): string { return this.store.staff() && this.o()?.customerId !== this.store.customerId() ? '/admin/orders' : `/account/orders/${this.id()}`; }
  print(): void { window.print(); }
}
