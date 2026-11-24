import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CATEGORY_GROUPS, PRODUCT_COUNT } from './data/catalog';
import { COMPANY } from './data/company';
import { Store } from './state/store';
import { Icon } from './ui/icon';
import { Logo } from './ui/logo';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, Icon, Logo],
  host: { '(window:scroll)': 'onScroll()' },
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly store = inject(Store);
  private readonly router = inject(Router);
  readonly company = COMPANY;
  readonly groups = CATEGORY_GROUPS;
  readonly productCount = PRODUCT_COUNT;
  readonly year = new Date().getFullYear();
  readonly menuOpen = signal(false);
  readonly productsOpen = signal(false);
  readonly scrolled = signal(false);
  onScroll(): void { this.scrolled.set(window.scrollY > 8); }
  q = '';
  firstName(): string {
    const w = (this.store.customer()?.name ?? '').replace(/^(Dr|Mr|Ms|Mrs|Prof)\.?\s+/i, '').split(' ').filter((x) => x.replace('.', '').length > 1);
    return w[0] ?? 'Account';
  }
  readonly isAdmin = signal(false);

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.isAdmin.set(e.urlAfterRedirects.startsWith('/admin'));
        this.menuOpen.set(false);
        this.productsOpen.set(false);
        window.scrollTo({ top: 0 });
      }
    });
  }

  search(): void {
    const q = this.q.trim();
    if (q) this.router.navigate(['/search'], { queryParams: { q } });
  }

  waLink(): string {
    return `https://wa.me/${this.company.whatsapp}?text=${encodeURIComponent('Hello Chitra Scientific, I would like a quotation for laboratory items.')}`;
  }
}
