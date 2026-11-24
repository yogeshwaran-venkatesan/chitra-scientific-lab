import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Store } from '../state/store';
import { RouterLink } from '@angular/router';
import { CATEGORY_GROUPS, CATEGORY_PHOTO } from '../data/catalog';

@Component({
  selector: 'cs-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
  <div class="wrap page-head">
    <nav class="crumbs"><a routerLink="/">Home</a> / <span>Products</span></nav>
    <h1>Products</h1>
    <p class="muted">A selection of {{ count() }} products across {{ catCount }} departments. Need something not listed? Add it as a note in your quote basket and we will source it.</p>
  </div>
  <div class="wrap">
    @for (g of groups; track g.name) {
      <section class="group" [id]="g.name">
        <h2>{{ g.name }}</h2>
        <div class="tiles">
          @for (c of g.categories; track c.slug) {
            <a class="tile" [routerLink]="['/products', c.slug]">
              <span class="ph"><img [src]="photo[c.slug]" [alt]="c.name" loading="lazy" /></span>
              <b>{{ c.name }}</b>
              <span>{{ c.blurb }}</span>
              <small>{{ store.categoryCount().get(c.slug) ?? 0 }} products</small>
            </a>
          }
        </div>
      </section>
    }
  </div>`,
  styles: [`
    .group { margin-bottom: 44px; scroll-margin-top: 150px; }
    .tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .tile { background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius-m); padding: 18px; display: grid; gap: 6px; align-content: start; text-decoration: none; color: var(--ink); }
    .ph { display: block; aspect-ratio: 4 / 3; margin-bottom: 8px; } .ph img { width: 100%; height: 100%; object-fit: contain; }
    .tile span { color: var(--muted); font-size: .9rem; }
    .tile small { color: var(--petrol); font-weight: 650; }
    .tile:hover { border-color: var(--line-2); color: var(--ink); box-shadow: var(--shadow-2); }
    @media (max-width: 900px) { .tiles { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .tiles { grid-template-columns: 1fr; } }
  `],
})
export class Products {
  readonly groups = CATEGORY_GROUPS;
  readonly photo = CATEGORY_PHOTO;
  readonly store = inject(Store);
  readonly count = computed(() => this.store.products().length);
  readonly catCount = CATEGORY_GROUPS.reduce((s, g) => s + g.categories.length, 0);
}
