import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { inr } from '../data/catalog';
import { COMPANY } from '../data/company';
import { Store } from '../state/store';
import { Icon } from '../ui/icon';
import { ProductCard, STOCK_LABEL } from '../ui/product-card';
import { tint } from '../ui/tint';

@Component({
  selector: 'cs-product',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, Icon, ProductCard],
  template: `
  @if (p(); as p) {
    <div class="wrap page-head">
      <nav class="crumbs"><a routerLink="/">Home</a> / <a routerLink="/products">Products</a> / <a [routerLink]="['/products', p.category]">{{ p.categoryName }}</a> / <span>{{ p.name }}</span></nav>
    </div>
    <div class="wrap detail">
      <div class="visual">
        <span class="scale-v"></span>
        <cs-icon [name]="p.icon" [size]="180" [weight]="1.1" />
        <span class="demo-note">Product photo from Chitra Scientific goes here</span>
      </div>
      <div class="info">
        <span class="meta">{{ p.brand }} · SKU {{ p.sku }}</span>
        <h1>{{ p.name }}</h1>
        <span class="stock" [class]="p.stock">{{ stockLabel[p.stock] }}</span>
        <div class="price-box">
          @if (p.enquiryOnly) {
            <b class="ask">Price on request</b>
            <p class="small muted">{{ p.category === 'chemicals' ? 'Hazardous or bulk chemical — supplied against a quotation and buyer declaration.' : 'Configured to your requirement — we send a quotation with options.' }}</p>
          } @else {
            @if (store.contractPct()) { <span class="contract">Your contract price ({{ store.contractPct() }}% off list {{ inr(p.price) }})</span><br> }
            <b>{{ inr(store.unitPrice(p)) }}</b> <span class="muted">+ {{ p.gstPct }}% GST · {{ p.pack }}</span>
            <p class="small muted">With GST: {{ inr(round(store.unitPrice(p) * (1 + p.gstPct / 100))) }} · HSN {{ p.hsn }}</p>
          }
        </div>
        <div class="buy">
          <label class="qty">Quantity
            <span class="stepper">
              <button type="button" (click)="qty.set(qty() > 1 ? qty() - 1 : 1)" aria-label="Less"><cs-icon name="minus" [size]="16" /></button>
              <input type="number" min="1" max="9999" [ngModel]="qty()" (ngModelChange)="setQty($event)" aria-label="Quantity" />
              <button type="button" (click)="qty.set(qty() < 9999 ? qty() + 1 : 9999)" aria-label="More"><cs-icon name="plus" [size]="16" /></button>
            </span>
          </label>
          @if (!p.enquiryOnly) { <button class="btn btn-primary" type="button" (click)="store.addToCart(p, qty())"><cs-icon name="cart" [size]="18" /> Add to cart</button> }
          <button class="btn" [class.btn-primary]="p.enquiryOnly" [class.btn-line]="!p.enquiryOnly" type="button" (click)="store.addToBasket(p, qty())"><cs-icon name="basket" [size]="18" /> Add to quote basket</button>
          <a class="btn btn-line" [href]="wa(p.name)" target="_blank" rel="noopener"><cs-icon name="whatsapp" [size]="18" /> Ask on WhatsApp</a>
        </div>
        @if (store.inCart(p.slug)) { <p class="small in-basket"><cs-icon name="check" [size]="16" /> {{ store.inCart(p.slug) }} in your cart · <a routerLink="/cart">View cart</a></p> }
        @if (store.inBasket(p.slug)) { <p class="small in-basket"><cs-icon name="check" [size]="16" /> {{ store.inBasket(p.slug) }} in your quote basket · <a routerLink="/quote">View basket</a></p> }
        <p>{{ p.description }}</p>
        <h2 class="h3">Specifications</h2>
        <table class="specs">
          @for (s of p.specs; track s[0]) { <tr><th>{{ s[0] }}</th><td>{{ s[1] }}</td></tr> }
          <tr><th>Pack</th><td>{{ p.pack }}</td></tr>
          <tr><th>GST</th><td>{{ p.gstPct }}% (HSN {{ p.hsn }})</td></tr>
        </table>
        <p class="demo-note">Specifications and prices in this prototype are samples. The company's actual data will be loaded before launch.</p>
        <ul class="assure">
          <li><cs-icon name="shield" [size]="20" /> Genuine brands, GST invoice with every order</li>
          <li><cs-icon name="truck" [size]="20" /> Delivery and installation for instruments</li>
          <li><cs-icon name="download" [size]="20" /> Brochure &amp; test certificate on request</li>
        </ul>
      </div>
    </div>
    @if (related().length) {
      <section class="wrap related">
        <h2>More in {{ p.categoryName }}</h2>
        <div class="grid">@for (r of related(); track r.slug) { <cs-product-card [product]="r" /> }</div>
      </section>
    }
  } @else {
    <div class="wrap page-head"><h1>Product not found</h1><p>This product may have been renamed. <a routerLink="/products">Browse all products</a> or use search above.</p></div>
  }`,
  styles: [`
    .detail { display: grid; grid-template-columns: 1fr 1.1fr; gap: 44px; align-items: start; }
    .visual { position: sticky; top: 110px; border-radius: var(--r-m); min-height: 440px; display: grid; place-items: center; color: #3f6f55; padding: 24px; background: #f4f5f2; border: 1px solid var(--line); }
    .visual .scale-v { display: none; }
    .visual .demo-note { position: absolute; bottom: 14px; left: 44px; right: 14px; }
    .meta { color: var(--muted); font-size: .88rem; }
    h1 { font-size: clamp(1.8rem, 3vw, 2.4rem); margin: 6px 0 10px; }
    .price-box { margin: 18px 0; padding: 16px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .price-box b { font-size: 1.8rem; font-weight: 600; }
    .price-box .ask { font-size: 1.4rem; }
    .price-box p { margin: 4px 0 0; }
    .buy { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 10px; }
    .qty { display: grid; gap: 6px; font-weight: 600; font-size: .9rem; }
    .stepper { display: inline-flex; border: 1.5px solid var(--line); border-radius: var(--radius-s); background: var(--paper); }
    .stepper button { width: 40px; border: 0; background: none; cursor: pointer; color: var(--ink); display: grid; place-items: center; }
    .stepper input { width: 70px; border: 0; text-align: center; min-height: 42px; border-radius: 0; }
    .contract { color: var(--ok); font-weight: 650; font-size: .88rem; }
    .in-basket { color: var(--ok); display: flex; gap: 6px; align-items: center; }
    .h3 { font-size: 1.15rem; margin-top: 22px; }
    .specs { width: 100%; border-collapse: collapse; margin-bottom: 14px; background: var(--paper); }
    .specs th, .specs td { text-align: left; padding: 9px 12px; border-bottom: 1px solid var(--line); font-size: .93rem; }
    .specs th { width: 40%; color: var(--muted); font-weight: 550; }
    .assure { list-style: none; padding: 0; margin: 18px 0 0; display: grid; gap: 10px; }
    .assure li { display: flex; gap: 10px; align-items: center; }
    .assure cs-icon { color: var(--petrol); }
    .related { margin-top: 64px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    @media (max-width: 900px) { .detail { grid-template-columns: 1fr; } .visual { position: relative; top: 0; min-height: 280px; } .grid { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class ProductPage {
  readonly store = inject(Store);
  readonly slug = input.required<string>();
  readonly p = computed(() => this.store.product(this.slug()));
  readonly related = computed(() => {
    const p = this.p();
    return p ? this.store.products().filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4) : [];
  });
  readonly qty = signal(1);
  readonly stockLabel = STOCK_LABEL;
  readonly inr = inr;
  readonly tint = tint;
  readonly round = (n: number) => Math.round(n * 100) / 100;

  constructor() {
    effect(() => { this.slug(); untracked(() => this.qty.set(1)); });
  }

  setQty(v: unknown): void {
    const n = Math.floor(Number(v));
    this.qty.set(Number.isFinite(n) ? Math.min(9999, Math.max(1, n)) : 1);
  }

  wa(name: string): string {
    return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(`Hello Chitra Scientific, please send price and availability for: ${name}`)}`;
  }
}
