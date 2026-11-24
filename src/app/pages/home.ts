import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, CATEGORY_PHOTO } from '../data/catalog';
import { COMPANY, INDUSTRIES, STOCKED_BRANDS } from '../data/company';
import { Store } from '../state/store';
import { Icon } from '../ui/icon';
import { HeroCarousel } from '../ui/hero-carousel';
import { inr } from '../ui/format';

const POPULAR = ['burettes', 'conical-flasks', 'analytical-weighing-balance', 'hot-air-oven', 'magnetic-stirrer', 'wash-bottles-ldpe', 'human-skeleton-full-size', 'tablet-hardness-tester'];

@Component({
  selector: 'cs-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, HeroCarousel],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly store = inject(Store);
  readonly co = COMPANY;
  readonly inr = inr;
  readonly cats = CATEGORIES.map((c) => ({ ...c, photo: CATEGORY_PHOTO[c.slug] }));
  readonly industries = INDUSTRIES.slice(0, 8);
  readonly brandGroups = Object.entries(STOCKED_BRANDS).filter(([k]) => k !== 'Physics');
  get popular() { return POPULAR.map((s) => this.store.product(s)!).filter(Boolean); }
  readonly wa = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent('Hello Chitra Scientific, I would like a quotation for laboratory items.')}`;
}
