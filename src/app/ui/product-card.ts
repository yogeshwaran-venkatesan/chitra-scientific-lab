import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, inr } from '../data/catalog';
import { Store } from '../state/store';
import { Icon } from './icon';

export const STOCK_LABEL = { in: 'In stock', low: 'Few left', order: 'Ships in 7–10 days' } as const;

@Component({
  selector: 'cs-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    @let p = product();
    <article class="card">
      <a class="visual" [routerLink]="['/product', p.slug]" [attr.aria-label]="p.name" tabindex="-1">
        <cs-icon [name]="p.icon" [size]="64" [weight]="1.4" />
        <span class="brand-chip">{{ p.brand }}</span>
        @if (p.stock === 'low') { <span class="flag">Few left</span> }
      </a>
      <div class="body">
        <h3><a [routerLink]="['/product', p.slug]">{{ p.name }}</a></h3>
        <span class="meta">{{ p.categoryName }} · {{ p.pack }}</span>
        <div class="foot">
          @if (p.enquiryOnly) {
            <span class="price ask">Price on request</span>
          } @else {
            <span class="price num">{{ inr(store.unitPrice(p)) }}@if (store.contractPct()) { <s>{{ inr(p.price) }}</s> }<small>+ GST</small></span>
          }
          <div class="acts">
            <button class="icon-btn" type="button" (click)="store.addToBasket(p)" [class.on]="store.inBasket(p.slug)" [attr.aria-label]="'Add ' + p.name + ' to quote basket'" title="Add to quote">
              <cs-icon [name]="store.inBasket(p.slug) ? 'check' : 'basket'" [size]="18" />
            </button>
            @if (!p.enquiryOnly) {
              <button class="icon-btn solid" type="button" (click)="store.addToCart(p)" [class.on]="store.inCart(p.slug)" [attr.aria-label]="'Add ' + p.name + ' to cart'" title="Add to cart">
                <cs-icon [name]="store.inCart(p.slug) ? 'check' : 'plus'" [size]="18" />
              </button>
            }
          </div>
        </div>
      </div>
    </article>`,
  styles: [`
    .card { position: relative; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-m); display: flex; flex-direction: column; height: 100%; overflow: hidden; transition: border-color .2s, box-shadow .2s; }
    .card:hover { border-color: var(--line-2); box-shadow: var(--shadow-2); }
    .visual { position: relative; display: grid; place-items: center; aspect-ratio: 4 / 3; color: #3f6f55; background: #f4f5f2; border-bottom: 1px solid var(--line); }
    .brand-chip { position: absolute; left: 10px; top: 10px; background: #fff; border: 1px solid var(--line); font-size: .72rem; font-weight: 500; padding: 2px 8px; border-radius: 6px; color: var(--ink); }
    .flag { position: absolute; right: 10px; top: 10px; background: #fff5e3; border: 1px solid #f0dfb8; color: #7a520e; font-size: .7rem; font-weight: 600; padding: 2px 8px; border-radius: 6px; }
    .body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
    h3 { font-family: var(--font); font-size: .95rem; font-weight: 550; letter-spacing: -.005em; margin: 0; line-height: 1.3; }
    h3 a { color: var(--ink); text-decoration: none; }
    h3 a::after { content: ''; position: absolute; inset: 0; } /* whole card clickable */
    .meta { font-size: .78rem; color: var(--muted); }
    .foot { margin-top: auto; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .price { font-weight: 600; font-size: 1.05rem; display: flex; align-items: baseline; gap: 5px; flex-wrap: wrap; }
    .price s { font-family: var(--font); font-weight: 450; color: var(--muted); font-size: .78rem; }
    .price small { font-family: var(--font); font-weight: 450; color: var(--muted); font-size: .72rem; }
    .ask { font-size: .88rem; color: var(--muted); font-weight: 560; }
    .acts { display: flex; gap: 6px; position: relative; z-index: 1; }
    .icon-btn { width: 38px; height: 38px; border-radius: 999px; display: grid; place-items: center; border: 1.5px solid var(--line-2); background: #fff; color: var(--ink); cursor: pointer; transition: all .2s var(--ease); }
    .icon-btn:hover { border-color: var(--ink); }
    .icon-btn.solid { background: var(--ink); border-color: var(--ink); color: #fff; }
    .icon-btn.solid:hover { background: #2b2e2b; border-color: #2b2e2b; }
    .icon-btn.on { background: var(--ok); border-color: var(--ok); color: #fff; }
  `],
})
export class ProductCard {
  readonly store = inject(Store);
  readonly product = input.required<Product>();
  readonly stockLabel = STOCK_LABEL;
  readonly inr = inr;
}
