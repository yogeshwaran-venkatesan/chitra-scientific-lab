import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEMO_PASSWORD, FREE_SHIPPING_FROM, Order, PayMethod, STATES } from '../state/models';
import { Store, passwordProblem, pwHash } from '../state/store';
import { Icon } from '../ui/icon';
import { EMAIL, GSTIN, PHONE, PIN, cleanPhone, inr } from '../ui/format';

// ════════════════════ Sign in (email + password) ════════════════════
type LoginStep = 'login' | 'register' | 'forgot' | 'sent' | 'reset';
@Component({
  selector: 'cs-login', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, RouterLink, Icon],
  template: `
  <div class="wrap narrow">
    <div class="page-head"><h1>{{ heading[step()] }}</h1><p class="muted">{{ sub[step()] }}</p></div>
    <div class="cols">
      @switch (step()) {
        @case ('login') {
          <form class="panel" (ngSubmit)="login()" novalidate>
            <div class="field"><label for="le">Email</label><input id="le" type="email" name="le" [(ngModel)]="email" autocomplete="username" /></div>
            <div class="field"><label for="lp">Password</label>
              <span class="pw"><input id="lp" [type]="show() ? 'text' : 'password'" name="lp" [(ngModel)]="password" autocomplete="current-password" maxlength="128" />
                <button type="button" class="eye" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'">{{ show() ? 'Hide' : 'Show' }}</button></span></div>
            <div class="row-between"><label class="chk"><input type="checkbox" name="rm" [(ngModel)]="remember" /> Keep me signed in</label>
              <button class="link" type="button" (click)="go2('forgot')">Forgot password?</button></div>
            @if (err()) { <p class="err" role="alert">{{ err() }}</p> }
            <button class="btn btn-primary full" type="submit" [disabled]="busy()">Sign in</button>
            <p class="small center">New here? <button class="link" type="button" (click)="go2('register')">Create an account</button></p>
          </form>
        }
        @case ('register') {
          <form class="panel" (ngSubmit)="register()" novalidate>
            <div class="field"><label for="rn">Your name</label><input id="rn" type="text" name="rn" [(ngModel)]="name" autocomplete="name" maxlength="80" /></div>
            <div class="field"><label for="re">Email</label><input id="re" type="email" name="re" [(ngModel)]="email" autocomplete="email" /></div>
            <div class="field"><label for="rp">Mobile <span class="muted">(for delivery, not for sign-in)</span></label><input id="rp" type="tel" name="rp" [(ngModel)]="phone" inputmode="numeric" maxlength="14" autocomplete="tel" /></div>
            <div class="field"><label for="rw">Password</label>
              <span class="pw"><input id="rw" [type]="show() ? 'text' : 'password'" name="rw" [(ngModel)]="password" autocomplete="new-password" maxlength="128" />
                <button type="button" class="eye" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'">{{ show() ? 'Hide' : 'Show' }}</button></span>
              <span class="hint">At least 8 characters, with a letter and a number.</span></div>
            <div class="field"><label for="rw2">Confirm password</label><input id="rw2" [type]="show() ? 'text' : 'password'" name="rw2" [(ngModel)]="password2" autocomplete="new-password" maxlength="128" /></div>
            @if (err()) { <p class="err" role="alert">{{ err() }}</p> }
            <button class="btn btn-primary full" type="submit" [disabled]="busy()">Create account</button>
            <p class="small center">Already registered? <button class="link" type="button" (click)="go2('login')">Sign in</button></p>
            <p class="small muted">Buying for a college, hospital or company? <a routerLink="/register">Register your institution</a> for contract prices and credit.</p>
          </form>
        }
        @case ('forgot') {
          <form class="panel" (ngSubmit)="forgot()" novalidate>
            <div class="field"><label for="fe">Email</label><input id="fe" type="email" name="fe" [(ngModel)]="email" autocomplete="email" /></div>
            @if (err()) { <p class="err" role="alert">{{ err() }}</p> }
            <button class="btn btn-primary full" type="submit">Send reset link</button>
            <p class="small center"><button class="link" type="button" (click)="go2('login')">Back to sign in</button></p>
          </form>
        }
        @case ('sent') {
          <div class="panel">
            <p>If an account exists for <b>{{ email }}</b>, we have emailed a link to reset the password. The link works once and expires in 30 minutes.</p>
            @if (resetFor) { <p class="demo-note">Demo: this is the page the email link opens. <button class="link" type="button" (click)="go2('reset')">Open the reset link</button></p> }
            <p class="small"><button class="link" type="button" (click)="go2('login')">Back to sign in</button></p>
          </div>
        }
        @case ('reset') {
          <form class="panel" (ngSubmit)="reset()" novalidate>
            <p class="small muted">Account: <b>{{ email }}</b></p>
            <div class="field"><label for="np">New password</label><input id="np" [type]="show() ? 'text' : 'password'" name="np" [(ngModel)]="password" autocomplete="new-password" maxlength="128" />
              <span class="hint">At least 8 characters, with a letter and a number.</span></div>
            <div class="field"><label for="np2">Confirm new password</label><input id="np2" [type]="show() ? 'text' : 'password'" name="np2" [(ngModel)]="password2" autocomplete="new-password" maxlength="128" /></div>
            <label class="chk"><input type="checkbox" name="sh" [checked]="show()" (change)="show.set(!show())" /> Show passwords</label>
            @if (err()) { <p class="err" role="alert">{{ err() }}</p> }
            <button class="btn btn-primary full" type="submit" [disabled]="busy()">Save new password and sign in</button>
          </form>
        }
      }
      <div class="panel demo">
        <h2 class="h3">Demo accounts</h2>
        <p class="muted small">For the client presentation — one click. Or sign in with the email below and the password <b>{{ demoPw }}</b>.</p>
        <button class="btn btn-line full" type="button" (click)="demo('c-college')"><cs-icon name="building" [size]="18" /> College buyer (contract prices, credit)</button>
        <button class="btn btn-line full" type="button" (click)="demo('c-priya')"><cs-icon name="user" [size]="18" /> Individual buyer</button>
        <button class="btn btn-line full" type="button" (click)="demo('c-hosp')"><cs-icon name="building" [size]="18" /> Hospital (waiting for approval)</button>
        <p class="small muted mono">chemistry&#64;slasc.example.in<br>priya&#64;example.com<br>purchase&#64;vhospital.example.in</p>
        <hr>
        <p class="small"><b>New institution?</b> <a routerLink="/register">Register for an account</a></p>
      </div>
    </div>
  </div>`,
  styles: [`.narrow { max-width: 900px; } .cols { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; align-items: start; }
    .full { width: 100%; margin-top: 10px; } .demo { display: grid; gap: 10px; } .h3 { font-size: 1.15rem; margin: 0; } .demo p { margin: 0; }
    .err { color: var(--litmus); font-weight: 600; font-size: .88rem; margin: 8px 0 0; } .link { background: none; border: 0; padding: 0; color: var(--petrol); text-decoration: underline; cursor: pointer; font: inherit; }
    .center { text-align: center; margin: 14px 0 0; } .mono { font-family: ui-monospace, Menlo, monospace; font-size: .8rem; line-height: 1.7; }
    .row-between { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin: 2px 0 4px; font-size: .9rem; }
    .chk { display: inline-flex; gap: 8px; align-items: center; cursor: pointer; font-size: .9rem; } .chk input { width: 16px; height: 16px; accent-color: var(--teal); }
    .pw { position: relative; display: block; } .pw input { padding-right: 70px; }
    .eye { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); background: none; border: 0; font: inherit; font-size: .82rem; font-weight: 600; color: var(--muted); cursor: pointer; padding: 6px 8px; border-radius: 6px; }
    .eye:hover { color: var(--ink); background: #f1f2ef; }
    hr { border: 0; border-top: 1px solid var(--line); width: 100%; } @media (max-width: 760px) { .cols { grid-template-columns: 1fr; } }`],
})
export class Login {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly step = signal<LoginStep>('login');
  readonly err = signal('');
  readonly busy = signal(false);
  readonly show = signal(false);
  readonly demoPw = DEMO_PASSWORD;
  readonly heading: Record<LoginStep, string> = { login: 'Sign in', register: 'Create an account', forgot: 'Reset your password', sent: 'Check your email', reset: 'Choose a new password' };
  readonly sub: Record<LoginStep, string> = {
    login: 'Sign in with your email and password.', register: 'Order online, track deliveries and download GST invoices.',
    forgot: 'Enter the email you registered with. We will send a reset link.', sent: 'Follow the link in the email to set a new password.', reset: 'Use at least 8 characters, with a letter and a number.',
  };
  email = ''; password = ''; password2 = ''; name = ''; phone = ''; remember = true;
  resetFor: string | null = null;
  /** wrong attempts per email in this browser; the live API also limits by account and by IP */
  private fails = new Map<string, { n: number; until: number }>();

  go2(s: LoginStep): void { this.err.set(''); this.password = ''; this.password2 = ''; this.step.set(s); }

  async login(): Promise<void> {
    const em = this.email.trim().toLowerCase();
    if (!EMAIL.test(em) || !this.password) return this.err.set('Enter your email and password.');
    const f = this.fails.get(em);
    if (f && f.until > Date.now()) return this.err.set(`Too many wrong attempts. Try again in ${Math.ceil((f.until - Date.now()) / 60000)} minutes, or reset your password.`);
    this.busy.set(true);
    const c = await this.store.checkPassword(em, this.password);
    this.busy.set(false);
    if (!c) {
      const n = (f?.n ?? 0) + 1;
      this.fails.set(em, { n, until: n >= 5 ? Date.now() + 15 * 60_000 : 0 });
      this.password = '';
      return this.err.set(n >= 5 ? 'Too many wrong attempts. Try again in 15 minutes, or reset your password.' : 'Email or password is not right.');
    }
    this.fails.delete(em);
    this.store.loginCustomer(c.id);
    this.next();
  }

  async register(): Promise<void> {
    const em = this.email.trim().toLowerCase(), ph = cleanPhone(this.phone);
    if (this.name.trim().length < 2) return this.err.set('Enter your name.');
    if (!EMAIL.test(em)) return this.err.set('Enter a valid email.');
    if (!PHONE.test(ph)) return this.err.set('Enter a 10-digit mobile number.');
    const bad = passwordProblem(this.password, em);
    if (bad) return this.err.set(bad);
    if (this.password !== this.password2) return this.err.set('The two passwords do not match.');
    if (this.store.findCustomerByEmail(em)) return this.err.set('This email already has an account. Sign in or reset the password.');
    this.busy.set(true);
    const c = this.store.registerRetail(this.name.trim().slice(0, 80), ph, em, await pwHash(em, this.password));
    this.busy.set(false);
    this.store.loginCustomer(c.id);
    this.store.say('Account created. (Live site: we first email a link to confirm the address.)');
    this.next();
  }

  forgot(): void {
    const em = this.email.trim().toLowerCase();
    if (!EMAIL.test(em)) return this.err.set('Enter a valid email.');
    // same answer whether or not the account exists, so nobody can probe which emails are registered
    this.resetFor = this.store.findCustomerByEmail(em)?.id ?? null;
    this.email = em; this.go2('sent');
  }

  async reset(): Promise<void> {
    if (!this.resetFor) return this.go2('forgot');
    const bad = passwordProblem(this.password, this.email);
    if (bad) return this.err.set(bad);
    if (this.password !== this.password2) return this.err.set('The two passwords do not match.');
    this.busy.set(true);
    await this.store.setPassword(this.resetFor, this.password);
    this.busy.set(false);
    this.fails.delete(this.email);
    this.store.loginCustomer(this.resetFor);
    this.resetFor = null;
    this.next();
  }

  demo(id: string): void { this.store.loginCustomer(id); this.next(); }
  private next(): void {
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
          <div class="field"><label for="em">Official email <span class="muted">(used to sign in)</span></label><input id="em" type="email" name="em" [(ngModel)]="f.email" autocomplete="email" [class.invalid]="e('email')" />@if (e('email'); as m) { <span class="err">{{ m }}</span> }</div>
          <div class="field"><label for="pw1">Password</label><input id="pw1" type="password" name="pw1" [(ngModel)]="f.pw" autocomplete="new-password" maxlength="128" [class.invalid]="e('pw')" />
            <span class="hint">At least 8 characters, with a letter and a number.</span>@if (e('pw'); as m) { <span class="err">{{ m }}</span> }</div>
          <div class="field"><label for="pw2">Confirm password</label><input id="pw2" type="password" name="pw2" [(ngModel)]="f.pw2" autocomplete="new-password" maxlength="128" [class.invalid]="e('pw2')" />@if (e('pw2'); as m) { <span class="err">{{ m }}</span> }</div>
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
  f = { org: '', dept: '', type: '', gstin: '', city: '', state: 'Tamil Nadu', name: '', role: '', phone: '', email: '', pw: '', pw2: '' };

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
      case 'email': return !EMAIL.test(f.email.trim()) ? 'Enter a valid email.' : this.store.findCustomerByEmail(f.email) ? 'This email already has an account — sign in instead.' : null;
      case 'pw': return passwordProblem(f.pw, f.email.trim());
      case 'pw2': return f.pw !== f.pw2 ? 'The two passwords do not match.' : null;
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
  async submit(): Promise<void> {
    this.tried.set(true);
    if (['org', 'type', 'gstin', 'city', 'name', 'phone', 'email', 'pw', 'pw2', 'doc'].some((k) => this.e(k))) return;
    const em = this.f.email.trim().toLowerCase();
    const { pw2: _, ...rest } = this.f;
    const c = this.store.registerInstitution({ ...rest, org: this.f.org.trim(), dept: this.f.dept.trim() || 'Main office', phone: cleanPhone(this.f.phone), email: em, role: this.f.role.trim() || 'Buyer', pw: await pwHash(em, this.f.pw) });
    this.f.pw = ''; this.f.pw2 = '';
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
