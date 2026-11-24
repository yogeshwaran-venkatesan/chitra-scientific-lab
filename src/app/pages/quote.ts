import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { inr } from '../data/catalog';
import { COMPANY } from '../data/company';
import { Store } from '../state/store';
import { Icon } from '../ui/icon';

interface Sent { ref: string; email: string; lines: number; when: string }

const PHONE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

@Component({
  selector: 'cs-quote',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, Icon],
  templateUrl: './quote.html',
  styleUrl: './quote.scss',
})
export class Quote {
  readonly store = inject(Store);
  readonly company = COMPANY;
  readonly inr = inr;
  readonly sent = signal<Sent | null>(null);
  readonly tried = signal(false);

  form = { name: '', org: '', type: '', designation: '', phone: '', email: '', gstin: '', city: '', needBy: '', note: '', consent: false };

  constructor() {
    // signed-in buyers don't type their details again
    const c = this.store.customer();
    const i = this.store.institution();
    if (c) Object.assign(this.form, { name: c.name, phone: c.phone, email: c.email, org: i ? `${i.name} — ${i.dept}` : 'Individual', type: i?.type ?? 'Individual', gstin: i?.gstin ?? '', city: i?.city ?? '', consent: true });
  }

  readonly movable = computed(() => this.store.basketItems().filter((l) => !l.product.enquiryOnly).length);
  moveToCart(): void {
    const n = this.store.moveBasketToCart();
    this.store.say(`${n} item${n === 1 ? '' : 's'} moved to your cart`, '/cart');
  }

  readonly estimate = computed(() =>
    this.store.basketItems().filter((l) => !l.product.enquiryOnly).reduce((s, l) => s + l.product.price * l.qty, 0));
  readonly askCount = computed(() => this.store.basketItems().filter((l) => l.product.enquiryOnly).length);

  err(field: string): string | null {
    if (!this.tried()) return null;
    const f = this.form;
    switch (field) {
      case 'name': return f.name.trim().length < 2 ? 'Enter your name.' : null;
      case 'org': return f.org.trim().length < 2 ? 'Enter your college, hospital or company name.' : null;
      case 'type': return !f.type ? 'Choose the type of organisation.' : null;
      case 'phone': return !PHONE.test(f.phone.replace(/\s|-/g, '').replace(/^(\+91|0)/, '')) ? 'Enter a 10-digit mobile number.' : null;
      case 'email': return !EMAIL.test(f.email.trim()) ? 'Enter an email address like name@college.edu.in.' : null;
      case 'gstin': return f.gstin && !GSTIN.test(f.gstin.trim().toUpperCase()) ? 'GSTIN has 15 characters, e.g. 33ABCDE1234F1Z5. Leave blank if you have none.' : null;
      case 'consent': return !f.consent ? 'Tick this so we can contact you about this quotation.' : null;
      default: return null;
    }
  }

  submit(ngf: NgForm): void {
    this.tried.set(true);
    const fields = ['name', 'org', 'type', 'phone', 'email', 'gstin', 'consent'];
    if (fields.some((f) => this.err(f))) {
      setTimeout(() => (document.querySelector('.invalid, .err') as HTMLElement | null)?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      return;
    }
    const lines = this.store.basketItems().length;
    const note = [this.form.designation && `Designation: ${this.form.designation}`, this.form.gstin && `GSTIN: ${this.form.gstin.toUpperCase()}`, this.form.city && `City: ${this.form.city}`, this.form.needBy && `Needed by: ${this.form.needBy}`, this.form.note].filter(Boolean).join('\n');
    const q = this.store.requestQuote({ name: this.form.name.trim(), org: this.form.org.trim(), email: this.form.email.trim(), phone: this.form.phone.replace(/\D/g, '').slice(-10), note });
    this.sent.set({ ref: q.number, email: this.form.email.trim(), lines, when: new Date().toLocaleString('en-IN') });
    ngf.resetForm();
    this.tried.set(false);
    window.scrollTo({ top: 0 });
  }

  setQty(slug: string, v: unknown): void {
    this.store.setQty(slug, Number(v));
  }
}
