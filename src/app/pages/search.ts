import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CATEGORIES, searchProducts } from '../data/catalog';
import { Store } from '../state/store';
import { ProductCard } from '../ui/product-card';

@Component({
  selector: 'cs-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard],
  template: `
  <div class="wrap page-head">
    <nav class="crumbs"><a routerLink="/">Home</a> / <span>Search</span></nav>
    <h1>Results for “{{ q() }}”</h1>
    <p class="muted">{{ results().length }} product{{ results().length === 1 ? '' : 's' }} found{{ cats().length ? ' · also see: ' : '' }}
      @for (c of cats(); track c.slug; let last = $last) { <a [routerLink]="['/products', c.slug]">{{ c.name }}</a>{{ last ? '' : ', ' }} }
    </p>
  </div>
  <div class="wrap">
    @if (results().length) {
      <div class="grid">@for (p of results(); track p.slug) { <cs-product-card [product]="p" /> }</div>
    } @else {
      <div class="panel">
        <h2 class="h3">No product matches “{{ q() }}”</h2>
        <p>Check the spelling or try a shorter word, such as “flask” instead of “conical flask 250 ml”. We also source items that are not listed — send us the name and we will quote.</p>
        <a class="btn btn-primary" routerLink="/quote">Ask for an item not listed</a>
      </div>
    }
  </div>`,
  styles: [`.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; } .h3 { font-size: 1.2rem; }
    @media (max-width: 1000px) { .grid { grid-template-columns: repeat(2, 1fr); } } @media (max-width: 540px) { .grid { grid-template-columns: 1fr; } }`],
})
export class Search {
  private readonly route = inject(ActivatedRoute);
  readonly q = toSignal(this.route.queryParamMap.pipe(map((m) => (m.get('q') ?? '').slice(0, 80))), { initialValue: '' });
  private readonly store = inject(Store);
  readonly results = computed(() => searchProducts(this.q(), 200, this.store.products()));
  readonly cats = computed(() => {
    const q = this.q().toLowerCase().trim();
    return q.length < 3 ? [] : CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4);
  });
}
