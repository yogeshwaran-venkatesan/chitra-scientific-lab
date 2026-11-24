import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Store } from '../state/store';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CATEGORY_PHOTO, Product, categoryBySlug } from '../data/catalog';
import { ProductCard } from '../ui/product-card';

type Sort = 'name' | 'price-asc' | 'price-desc';

@Component({
  selector: 'cs-category',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, ProductCard],
  template: `
  @if (cat(); as c) {
    <div class="wrap page-head">
      <nav class="crumbs"><a routerLink="/">Home</a> / <a routerLink="/products">Products</a> / <span>{{ c.name }}</span></nav>
      <div class="head-row">
        @if (photo[c.slug]) { <img class="head-ph" [src]="photo[c.slug]" [alt]="c.name" /> }
        <div><h1>{{ c.name }}</h1><p class="muted">{{ c.blurb }}</p></div>
      </div>
    </div>
    <div class="wrap layout">
      <button class="btn btn-line btn-sm filter-toggle" type="button" (click)="showFilters.set(!showFilters())" [attr.aria-expanded]="showFilters()">
        {{ showFilters() ? 'Hide filters' : 'Filters' }}{{ active() ? ' (on)' : '' }}
      </button>
      <aside class="filters" [class.open]="showFilters()" aria-label="Filters">
        <div class="field"><label for="f">Filter in this category</label><input id="f" type="search" [ngModel]="text()" (ngModelChange)="text.set($event)" placeholder="e.g. glass, digital" /></div>
        <fieldset>
          <legend>Brand</legend>
          @for (b of brands(); track b) {
            <label class="chk"><input type="checkbox" [checked]="picked().has(b)" (change)="toggle(b)" /> {{ b }}</label>
          }
        </fieldset>
        <fieldset>
          <legend>Availability</legend>
          <label class="chk"><input type="checkbox" [checked]="inStock()" (change)="inStock.set(!inStock())" /> In stock only</label>
          <label class="chk"><input type="checkbox" [checked]="buyOnline()" (change)="buyOnline.set(!buyOnline())" /> Price shown (no enquiry needed)</label>
        </fieldset>
        @if (active()) { <button class="btn btn-ghost btn-sm" type="button" (click)="reset()">Clear filters</button> }
      </aside>
      <section>
        <div class="bar">
          <span class="muted">{{ list().length }} of {{ all().length }} products</span>
          <label>Sort <select [ngModel]="sort()" (ngModelChange)="sort.set($event)">
            <option value="name">Name A–Z</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option>
          </select></label>
        </div>
        @if (list().length) {
          <div class="grid">@for (p of list(); track p.slug) { <cs-product-card [product]="p" /> }</div>
        } @else {
          <div class="panel empty"><b>No products match these filters.</b><p class="muted">Clear a filter, or tell us what you need in the quote basket and we will source it.</p>
            <button class="btn btn-line btn-sm" type="button" (click)="reset()">Clear filters</button></div>
        }
      </section>
    </div>
  } @else {
    <div class="wrap page-head"><h1>Category not found</h1><p>This category does not exist. <a routerLink="/products">See all products</a>.</p></div>
  }`,
  styles: [`
    .head-row { display: flex; gap: 18px; align-items: center; }
    .head-ph { width: 132px; height: 100px; object-fit: contain; background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 6px; }
    .head-row h1 { margin-bottom: 4px; }
    .layout { display: grid; grid-template-columns: 240px 1fr; gap: 28px; }
    .filters { align-self: start; position: sticky; top: 150px; }
    fieldset { border: 0; border-top: 1px solid var(--line); padding: 12px 0; margin: 0; display: grid; gap: 8px; }
    legend { font-weight: 650; font-size: .9rem; padding: 0; margin-bottom: 4px; }
    .chk { display: flex; gap: 8px; align-items: center; font-size: .92rem; cursor: pointer; }
    .chk input { width: 18px; height: 18px; accent-color: var(--petrol); }
    .bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 12px; }
    .bar select { width: auto; min-height: 38px; margin-left: 6px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .empty { text-align: left; }
    .filter-toggle { display: none; justify-self: start; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; gap: 16px; } .filters { position: static; display: none; } .filters.open { display: block; } .filter-toggle { display: inline-flex; }
      .head-ph { width: 96px; height: 72px; } .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 540px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class Category {
  readonly photo = CATEGORY_PHOTO;
  readonly slug = input.required<string>();
  readonly cat = computed(() => categoryBySlug(this.slug()));
  private readonly store = inject(Store);
  readonly all = computed(() => this.store.products().filter((p) => p.category === this.slug()));
  readonly brands = computed(() => [...new Set(this.all().map((p) => p.brand))].sort());
  readonly text = signal('');
  readonly picked = signal(new Set<string>());
  readonly inStock = signal(false);
  readonly buyOnline = signal(false);
  readonly sort = signal<Sort>('name');
  readonly showFilters = signal(false);
  readonly active = computed(() => !!this.text() || this.picked().size > 0 || this.inStock() || this.buyOnline());

  readonly list = computed(() => {
    const t = this.text().toLowerCase().trim();
    const out: Product[] = this.all().filter((p) =>
      (!t || p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t)) &&
      (!this.picked().size || this.picked().has(p.brand)) &&
      (!this.inStock() || p.stock === 'in') &&
      (!this.buyOnline() || !p.enquiryOnly));
    const s = this.sort();
    return out.sort((a, b) => s === 'name' ? a.name.localeCompare(b.name) : s === 'price-asc' ? a.price - b.price : b.price - a.price);
  });

  constructor() {
    // a new category starts with no filters
    effect(() => { this.slug(); untracked(() => this.reset()); });
  }

  toggle(b: string): void {
    const n = new Set(this.picked());
    if (n.has(b)) n.delete(b); else n.add(b);
    this.picked.set(n);
  }
  reset(): void {
    this.text.set(''); this.picked.set(new Set()); this.inStock.set(false); this.buyOnline.set(false);
  }
}
