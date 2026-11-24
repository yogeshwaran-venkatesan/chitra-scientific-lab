import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FREE_SHIPPING_FROM, Order, PayMethod, STATES } from '../state/models';
import { Store } from '../state/store';
import { Icon } from '../ui/icon';
import { EMAIL, GSTIN, PHONE, PIN, cleanPhone, inr } from '../ui/format';

// ════════════════════ Sign in (mobile OTP, demo) ════════════════════
@Component({
  selector: 'cs-login', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, RouterLink, Icon],
  template: `
  <div class="wrap narrow">
    <div class="page-head"><h1>Sign in</h1><p class="muted">Use your mobile number. We send a one-time code by SMS.</p></div>
    <div class="cols">
      <form class="panel" (ngSubmit)="step() === 'phone' ? sendOtp() : verify()" novalidate>
        @if (step() === 'phone') {
          <div class="field"><label for="ph">Mobile number</label><input id="ph" type="tel" name="ph" [(ngModel)]="phone" inputmode="numeric" maxlength="14" autocomplete="tel" placeholder="10-digit mobile" />
            @if (err()) { <span class="err">{{ err() }}</span> }</div>
          <button class="btn btn-primary full" type="submit">Send code</button>
        } @else if (step() === 'otp') {
          <p>Code sent to <b>+91 {{ phone }}</b>. <button class="link" type="button" (click)="step.set('phone')">Change</button></p>
          <p class="demo-note">Demo: the code is <b>123456</b>.</p>
          <div class="field"><label for="otp">6-digit code</label><input id="otp" type="text" name="otp" [(ngModel)]="otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" />
            @if (err()) { <span class="err">{{ err() }}</span> }</div>
          <button class="btn btn-primary full" type="submit">Verify and sign in</button>
        } @else {
          <p>No account for <b>+91 {{ phone }}</b> yet. Tell us who you are:</p>
          <div class="field"><label for="nm">Your name</label><input id="nm" type="text" name="nm" [(ngModel)]="name" autocomplete="name" /></div>
          <div class="field"><label for="em">Email</label><input id="em" type="email" name="em" [(ngModel)]="email" autocomplete="email" /></div>
          @if (err()) { <span class="err">{{ err() }}</span> }
          <button class="btn btn-primary full" type="submit">Create account</button>
          <p class="small muted">Buying for a college, hospital or company? <a routerLink="/register">Register your institution</a> for contract prices and credit.</p>
        }
      </form>
      <div class="panel demo">
        <h2 class="h3">Demo accounts</h2>
        <p class="muted small">For the client presentation — one click, no OTP.</p>
        <button class="btn btn-line full" type="button" (click)="demo('c-college')"><cs-icon name="building" [size]="18" /> College buyer (contract prices, credit)</button>
        <button class="btn btn-line full" type="button" (click)="demo('c-priya')"><cs-icon name="user" [size]="18" /> Individual buyer</button>
        <button class="btn btn-line full" type="button" (click)="demo('c-hosp')"><cs-icon name="building" [size]="18" /> Hospital (waiting for approval)</button>
        <hr>
        <p class="small"><b>New institution?</b> <a routerLink="/register">Register for an account</a></p>
      </div>
    </div>
  </div>`,
  styles: [`.narrow { max-width: 900px; } .cols { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; align-items: start; }
    .full { width: 100%; margin-top: 6px; } .demo { display: grid; gap: 10px; } .h3 { font-size: 1.15rem; margin: 0; } .demo p { margin: 0; }
    .err { color: var(--litmus); font-weight: 600; font-size: .85rem; } .link { background: none; border: 0; color: var(--petrol); text-decoration: underline; cursor: pointer; font: inherit; }
    hr { border: 0; border-top: 1px solid var(--line); width: 100%; } @media (max-width: 760px) { .cols { grid-template-columns: 1fr; } }`],
})
export class Login {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly step = signal<'phone' | 'otp' | 'new'>('phone');
  readonly err = signal('');
  phone = ''; otp = ''; name = ''; email = '';
  private tries = 0;

  sendOtp(): void {
    const p = cleanPhone(this.phone);
    if (!PHONE.test(p)) return this.err.set('Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.');
    this.phone = p; this.err.set(''); this.otp = ''; this.tries = 0; this.step.set('otp');
  }
  verify(): void {
    if (this.step() === 'new') return this.create();
    if (this.tries >= 5) return this.err.set('Too many wrong codes. Ask for a new code.');
    if (this.otp.trim() !== '123456') { this.tries++; return this.err.set(`That code is not right. ${5 - this.tries} tries left.`); }
    const c = this.store.findCustomerByPhone(this.phone);
    if (!c) { this.err.set(''); this.step.set('new'); return; }
    this.store.loginCustomer(c.id);
    this.go();
  }
  create(): void {
    if (this.name.trim().length < 2 || !EMAIL.test(this.email.trim())) return this.err.set('Enter your name and a valid email.');
    const c = this.store.registerRetail(this.name.trim(), this.phone, this.email.trim());
    this.store.loginCustomer(c.id);
    this.go();
  }
  demo(id: string): void { this.store.loginCustomer(id); this.go(); }
  private go(): void {
    const next = this.route.snapshot.queryParamMap.get('next');
    this.router.navigateByUrl(next && next.startsWith('/') && !next.startsWith('//') ? next : '/account');
  }
}

// ════════════════════ Register an institution ════════════════════
@Component({
  selector: 'cs-register', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, RouterLink, Icon],
  template: `
  <div class="wrap narrow">
    <div class="page-head"><nav class="crumbs"><a routerLink="/">Home</a> / <span>Register your institution</span></nav>
      <h1>Register your institution</h1>
      <p class="muted">Colleges, hospitals, research labs and companies get contract prices, purchase-order buying and credit terms once approved — usually within one working day.</p></div>
    @if (done()) {
      <div class="panel ok"><cs-icon name="check" [size]="36" /><div><h2>Registration received</h2>
        <p>{{ f.org }} is waiting for approval. You are signed in and can request quotations now; contract prices start after approval.</p>
        <a class="btn btn-dark" routerLink="/products">Browse products</a></div></div>
    } @else {
      <form class="panel" (ngSubmit)="submit()" novalidate>
        <h2 class="h3">Organisation</h2>
        <div class="two">
          <div class="field"><label for="o">Institution / company name</label><input id="o" type="text" name="o" [(ngModel)]="f.org" [class.invalid]="e('org')" />@if (e('org'); as m) { <span class="err">{{ m }}</span> }</div>
          <div class="field"><label for="d">Department / lab</label><input id="d" type="text" name="d" [(ngModel)]="f.dept" placeholder="e.g. Department of Microbiology" /></div>
          <div class="field"><label for="t">Type</label><select id="t" name="t" [(ngModel)]="f.type" [class.invalid]="e('type')"><option value="">Choose…</option>@for (t of types; track t) { <option>{{ t }}</option> }</select>@if (e('type'); as m) { <span class="err">{{ m }}</span> }</div>
          <div class="field"><label for="g">GSTIN</label><input id="g" type="text" name="g" [(ngModel)]="f.gstin" maxlength="15" [class.invalid]="e('gstin')" />
            <span class="hint">Needed for GST invoices with input credit. Government institutions without GSTIN: write NA.</span>@if (e('gstin'); as m) { <span class="err">{{ m }}</span> }</div>
          <div class="field"><label for="c">City</label><input id="c" type="text" name="c" [(ngModel)]="f.city" [class.invalid]="e('city')" />@if (e('city'); as m) { <span class="err">{{ m }}</span> }</div>
          <div class="field"><label for="s">State</label><select id="s" name="s" [(ngModel)]="f.state">@for (s of states; track s) { <option>{{ s }}</option> }</select></div>
        </div>
        <h2 class="h3">Your details</h2>
        <div class="two">
          <div class="field"><label for="n">Your name</label><input id="n" type="text" name="n" [(ngModel)]="f.name" [class.invalid]="e('name')" />@if (e('name'); as m) { <span class="err">{{ m }}</span> }</div>
          <div class="field"><label for="r">Your role</label><input id="r" type="text" name="r" [(ngModel)]="f.role" placeholder="e.g. HOD, Purchase officer" /></div>
          <div class="field"><label for="p">Mobile</label><input id="p" type="tel" name="p" [(ngModel)]="f.phone" maxlength="14" [class.invalid]="e('phone')" />@if (e('phone'); as m) { <span class="err">{{ m }}</span> }</div>
          <div class="field"><label for="em">Official email</label><input id="em" type="email" name="em" [(ngModel)]="f.email" [class.invalid]="e('email')" />@if (e('email'); as m) { <span class="err">{{ m }}</span> }</div>
        </div>
        <div class="field"><label for="doc">Letterhead or ID proof <span class="muted">(PDF or image, up to 5 MB)</span></label><input id="doc" type="file" accept=".pdf,image/*" (change)="file($event)" />
          @if (e('doc'); as m) { <span class="err">{{ m }}</span> } @else if (docName) { <span class="hint">Attached: {{ docName }}</span> }</div>
        <button class="btn btn-primary" type="submit">Submit for approval</button>
      </form>
    }
  </div>`,
  styles: [`.narrow { max-width: 900px; } .two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; } .h3 { font-size: 1.1rem; margin-top: 8px; }
    .err { color: var(--litmus); font-weight: 600; font-size: .82rem; } .ok { display: flex; gap: 18px; } .ok cs-icon { color: var(--ok); }
    @media (max-width: 640px) { .two { grid-template-columns: 1fr; } }`],
})
export class Register {
  private readonly store = inject(Store);
  readonly states = STATES;
  readonly types = ['College / university', 'School', 'Hospital / medical college', 'Research laboratory', 'Industry / QC lab', 'Government department'];
  readonly done = signal(false);
  readonly tried = signal(false);
  docName = ''; docErr = '';
  f = { org: '', dept: '', type: '', gstin: '', city: '', state: 'Tamil Nadu', name: '', role: '', phone: '', email: '' };

  e(k: string): string | null {
    if (!this.tried()) return null;
    const f = this.f;
    const g = f.gstin.trim().toUpperCase();
    switch (k) {
      case 'org': return f.org.trim().length < 3 ? 'Enter the institution name.' : null;
      case 'type': return !f.type ? 'Choose a type.' : null;
      case 'gstin': return g !== 'NA' && !GSTIN.test(g) ? 'GSTIN has 15 characters, e.g. 33ABCDE1234F1Z5 (or NA).' : null;
      case 'city': return f.city.trim().length < 2 ? 'Enter the city.' : null;
      case 'name': return f.name.trim().length < 2 ? 'Enter your name.' : null;
      case 'phone': return !PHONE.test(cleanPhone(f.phone)) ? 'Enter a 10-digit mobile number.' : this.store.findCustomerByPhone(cleanPhone(f.phone)) ? 'This mobile already has an account — sign in instead.' : null;
      case 'email': return !EMAIL.test(f.email.trim()) ? 'Enter a valid email.' : null;
      case 'doc': return this.docErr || (!this.docName ? 'Attach a letterhead or ID proof.' : null);
    }
    return null;
  }
  file(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    this.docErr = ''; this.docName = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { this.docErr = 'File is larger than 5 MB.'; return; }
    if (!/^(application\/pdf|image\/(png|jpeg|webp))$/.test(file.type)) { this.docErr = 'Only PDF, PNG, JPG or WEBP files.'; return; }
    this.docName = file.name.slice(0, 80);
  }
  submit(): void {
    this.tried.set(true);
    if (['org', 'type', 'gstin', 'city', 'name', 'phone', 'email', 'doc'].some((k) => this.e(k))) return;
    const c = this.store.registerInstitution({ ...this.f, org: this.f.org.trim(), dept: this.f.dept.trim() || 'Main office', phone: cleanPhone(this.f.phone), email: this.f.email.trim(), role: this.f.role.trim() || 'Buyer' });
    this.store.loginCustomer(c.id);
    this.done.set(true);
  }
}

// ════════════════════ Cart ════════════════════
@Component({
  selector: 'cs-cart', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, RouterLink, Icon],
  template: `
  <div class="wrap page-head"><nav class="crumbs"><a routerLink="/">Home</a> / <span>Cart</span></nav><h1>Your cart</h1></div>
  @if (!store.cartItems().length) {
    <div class="wrap"><div class="panel empty"><cs-icon name="cart" [size]="44" /><h2>Your cart is empty</h2>
      <p>Add products with a price to buy online. For large orders or items priced on request, use the quote basket.</p>
      <a class="btn btn-primary" routerLink="/products">Browse products</a></div></div>
  } @else {
    <div class="wrap layout">
      <section>
        <table class="lines">
          <thead><tr><th>Product</th><th class="r">Price</th><th>Qty</th><th class="r">Amount</th><th><span class="sr-only">Remove</span></th></tr></thead>
          <tbody>
            @for (l of store.cartItems(); track l.slug) {
              <tr>
                <td><a [routerLink]="['/product', l.slug]">{{ l.product.name }}</a><small>{{ l.product.brand }} · {{ l.product.sku }} · {{ l.product.pack }}</small></td>
                <td class="r">{{ inr(l.unit) }}</td>
                <td><input class="q" type="number" min="1" max="9999" [ngModel]="l.qty" (ngModelChange)="store.setCartQty(l.slug, +$event)" [attr.aria-label]="'Quantity of ' + l.product.name" /></td>
                <td class="r">{{ inr(l.unit * l.qty) }}</td>
                <td><button class="btn btn-ghost btn-sm" type="button" (click)="store.removeFromCart(l.slug)" [attr.aria-label]="'Remove ' + l.product.name"><cs-icon name="trash" [size]="18" /></button></td>
              </tr>
            }
          </tbody>
        </table>
        @if (store.institution()) {
          <div class="panel side-note"><b>Need a formal quotation for your purchase committee?</b><span class="muted small">Send this cart as a quotation request instead of ordering now.</span>
            <button class="btn btn-line btn-sm" type="button" (click)="toQuote()">Turn cart into quotation request</button></div>
        }
      </section>
      <aside class="panel sum">
        <h2 class="h3">Order summary</h2>
        @if (!store.contractPct()) {
          <div class="coupon"><label class="sr-only" for="cp">Coupon</label><input id="cp" type="text" [ngModel]="coupon()" (ngModelChange)="coupon.set($event)" placeholder="Coupon code" maxlength="20" />
            <span class="muted small">Try LAB10 on orders above ₹5,000</span></div>
          @if (t().couponError && coupon()) { <p class="err">{{ t().couponError }}</p> }
        }
        <dl>
          <dt>Items</dt><dd>{{ inr(t().subtotal) }}</dd>
          @if (t().discount) { <dt>Coupon {{ coupon().toUpperCase() }}</dt><dd class="good">− {{ inr(t().discount) }}</dd> }
          <dt>Delivery</dt><dd>{{ t().shipping ? inr(t().shipping) : 'Free' }}</dd>
          <dt>GST (estimated)</dt><dd>{{ inr(t().cgst + t().sgst + t().igst) }}</dd>
          <dt class="tot">Total</dt><dd class="tot">{{ inr(t().total) }}</dd>
        </dl>
        @if (t().shipping) { <p class="small muted">Add {{ inr(free - (t().subtotal - t().discount)) }} more for free delivery.</p> }
        <button class="btn btn-primary full" type="button" (click)="checkout()">Proceed to checkout</button>
        <p class="small muted">GST is worked out on the next step from your delivery state.</p>
      </aside>
    </div>
  }`,
  styleUrl: './shop.scss',
})
export class Cart {
  readonly store = inject(Store);
  private readonly router = inject(Router);
  readonly inr = inr;
  readonly free = FREE_SHIPPING_FROM;
  readonly coupon = signal(sessionCoupon());
  readonly t = computed(() => this.store.totals(this.store.cartItems(), this.store.customer()?.addresses[0]?.state ?? 'Tamil Nadu', this.coupon()));
  checkout(): void {
    try { sessionStorage.setItem('cs.coupon', this.t().discount ? this.coupon().trim().toUpperCase() : ''); } catch { /* ignore */ }
    this.router.navigateByUrl('/checkout');
  }
  toQuote(): void { this.store.cartToBasket(); this.router.navigateByUrl('/quote'); }
}
function sessionCoupon(): string { try { return sessionStorage.getItem('cs.coupon') ?? ''; } catch { return ''; } }

// ════════════════════ Checkout ════════════════════
@Component({
  selector: 'cs-checkout', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './shop.scss',
})
export class Checkout {
  readonly store = inject(Store);
  private readonly router = inject(Router);
  readonly inr = inr;
  readonly states = STATES;
  readonly tried = signal(false);
  readonly placing = signal(false);
  readonly coupon = sessionCoupon();
  readonly canCredit = computed(() => this.store.institution()?.status === 'APPROVED' && (this.store.institution()?.creditDays ?? 0) > 0);
  pay = signal<PayMethod>('ONLINE');
  a = { ...(this.store.customer()?.addresses[0] ?? { name: this.store.customer()?.name ?? '', line1: '', line2: '', city: '', state: 'Tamil Nadu', pin: '', phone: this.store.customer()?.phone ?? '' }) };
  readonly addrState = signal(this.a.state);
  po = { number: '', file: '' };
  poErr = '';
  readonly t = computed(() => this.store.totals(this.store.cartItems(), this.addrState(), this.coupon));

  e(k: string): string | null {
    if (!this.tried()) return null;
    const a = this.a;
    switch (k) {
      case 'name': return a.name.trim().length < 2 ? 'Enter the receiver\'s name.' : null;
      case 'line1': return a.line1.trim().length < 4 ? 'Enter the building and street.' : null;
      case 'city': return a.city.trim().length < 2 ? 'Enter the city.' : null;
      case 'pin': return !PIN.test(a.pin.trim()) ? 'PIN code has 6 digits.' : null;
      case 'phone': return !PHONE.test(cleanPhone(a.phone)) ? 'Enter a 10-digit mobile for the courier.' : null;
      case 'po': return this.pay() === 'CREDIT' && (!this.po.number.trim() || !this.po.file) ? 'Purchase order number and file are required for credit orders.' : this.poErr || null;
    }
    return null;
  }
  poFile(ev: Event): void {
    const f = (ev.target as HTMLInputElement).files?.[0];
    this.poErr = ''; this.po.file = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { this.poErr = 'PO file is larger than 5 MB.'; return; }
    if (!/^(application\/pdf|image\/(png|jpeg|webp))$/.test(f.type)) { this.poErr = 'Upload the PO as PDF, PNG or JPG.'; return; }
    this.po.file = f.name.slice(0, 80);
  }
  place(): void {
    this.tried.set(true);
    if (['name', 'line1', 'city', 'pin', 'phone', 'po'].some((k) => this.e(k)) || this.placing()) return;
    this.placing.set(true);
    const o: Order = this.store.placeOrder({ address: { ...this.a, phone: cleanPhone(this.a.phone), pin: this.a.pin.trim() }, pay: this.pay(), coupon: this.coupon,
      poNumber: this.po.number.trim() || undefined, poFile: this.po.file || undefined });
    try { sessionStorage.removeItem('cs.coupon'); } catch { /* ignore */ }
    this.router.navigateByUrl(o.status === 'PAYMENT_PENDING' ? `/pay/${o.id}` : `/account/orders/${o.id}?new=1`);
  }
}

// ════════════════════ Demo payment page (generic — not a copy of any real gateway) ════════════════════
@Component({
  selector: 'cs-pay', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, Icon, FormsModule],
  template: `
  <div class="paywrap">
    @if (o(); as o) {
      <div class="paybox">
        <div class="payhead"><span>Secure payment</span><span class="demo-tag">DEMO — no money moves</span></div>
        <p class="muted small">Paying Chitra Scientific Industries · Order {{ o.number }}</p>
        <div class="amt">{{ inr(o.total) }}</div>
        @if (o.status !== 'PAYMENT_PENDING') {
          <p class="good"><cs-icon name="check" [size]="18" /> This order is already paid.</p>
          <a class="btn btn-dark" [routerLink]="['/account/orders', o.id]">View order</a>
        } @else {
          <div class="methods" role="radiogroup" aria-label="Payment method">
            @for (m of methods; track m) { <label class="m" [class.on]="method() === m"><input type="radio" name="m" [value]="m" [ngModel]="method()" (ngModelChange)="method.set($event)" /> {{ m }}</label> }
          </div>
          <button class="btn btn-primary full" type="button" (click)="result(true)">Pay {{ inr(o.total) }}</button>
          <button class="btn btn-ghost full" type="button" (click)="result(false)">Simulate a failed payment</button>
          @if (failed()) { <p class="err">Payment failed — you were not charged. Try again or choose another method.</p> }
          <p class="small muted">In the live site this step is the payment gateway (Razorpay or the bank the company chooses). The order is confirmed only after the gateway's signed confirmation reaches the server.</p>
        }
      </div>
    } @else { <div class="paybox"><h1 class="h3">Order not found</h1><a routerLink="/account">Go to my account</a></div> }
  </div>`,
  styleUrl: './shop.scss',
})
export class Pay {
  readonly store = inject(Store);
  private readonly router = inject(Router);
  readonly id = input.required<string>();
  readonly inr = inr;
  readonly o = computed(() => this.store.myOrders().find((x) => x.id === this.id()));
  readonly methods = ['UPI', 'Debit / credit card', 'Net banking'];
  readonly method = signal('UPI');
  readonly failed = signal(false);
  result(ok: boolean): void {
    this.store.paymentResult(this.id(), ok, this.method());
    if (ok) this.router.navigateByUrl(`/account/orders/${this.id()}?new=1`);
    else this.failed.set(true);
  }
}
