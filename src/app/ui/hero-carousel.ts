import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Slide {
  /** 'photo' = full-bleed photograph; 'plate' = catalogue product photo shown on a brand-colour field */
  kind: 'photo' | 'plate';
  img: string;
  alt: string;
  label: string;
  title: string;
  text: string;
  cta: { label: string; link: string };
  tone?: 'green' | 'ink' | 'stone';
  /** CSS object-position for photos */
  focus?: string;
  /** smaller file for phones */
  mobile?: string;
  /** put the text on the right when the photo's subject is on the left */
  align?: 'right';
}

/**
 * Home hero carousel. Real photographs from the client's catalogue (more people/lab photos drop into public/img/hero-*.webp).
 * Auto-advances every 6.5 s (always, including with reduced motion, where the slide simply cross-fades); waits while the tab is hidden; Pause button or Esc stops it.
 * Accessible: region with aria-roledescription, labelled slides, buttons for previous / next / pause, live region off while playing.
 */
@Component({
  selector: 'cs-hero-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { '(keydown.escape)': 'paused.set(true)' },
  template: `
  <section class="hc" aria-roledescription="carousel" aria-label="Chitra Scientific — highlights">
    <div class="track" [attr.aria-live]="playing() ? 'off' : 'polite'">
      @for (s of slides; track s.img; let i = $index) {
        <article class="slide" [class.on]="i === cur()" [class.plate]="s.kind === 'plate'" [attr.data-tone]="s.tone ?? 'green'" [attr.data-align]="s.align ?? null"
          role="group" aria-roledescription="slide" [attr.aria-label]="(i + 1) + ' of ' + slides.length" [attr.aria-hidden]="i !== cur()" [attr.inert]="i !== cur() ? '' : null">
          @if (s.kind === 'photo') {
            <img class="bg" [src]="s.img" [attr.srcset]="s.mobile ? s.mobile + ' 1100w, ' + s.img + ' 2400w' : null" sizes="100vw" [alt]="s.alt" [style.object-position]="s.focus ?? '50% 30%'" [attr.fetchpriority]="i === 0 ? 'high' : 'low'" loading="eager" decoding="async" />
            <span class="shade" aria-hidden="true"></span>
          } @else {
            <figure class="plate-img"><img [src]="s.img" [alt]="s.alt" loading="lazy" /></figure>
          }
          <div class="wrap copy" [style.--n]="s.title.split(' ').length">
            <p class="label"><span class="rule" aria-hidden="true"></span>{{ s.label }}</p>
            @if (i === 0) { <h1>@for (w of s.title.split(' '); track $index; let k = $index) {<span class="w"><span [style.--k]="k">{{ w }}</span></span> }</h1> }
            @else { <h2>@for (w of s.title.split(' '); track $index; let k = $index) {<span class="w"><span [style.--k]="k">{{ w }}</span></span> }</h2> }
            <p class="text">{{ s.text }}</p>
            <div class="acts">
              <a class="btn btn-light" [routerLink]="s.cta.link">{{ s.cta.label }}</a>
              <a class="btn btn-outline-light" routerLink="/quote">Request a quotation</a>
            </div>
          </div>
        </article>
      }
    </div>

    <div class="wrap ctrl">
      <div class="dots" role="tablist" aria-label="Choose a slide">
        @for (s of slides; track s.img; let i = $index) {
          <button type="button" role="tab" [attr.aria-selected]="i === cur()" [attr.aria-label]="'Slide ' + (i + 1) + ': ' + s.label" (click)="go(i)" [class.on]="i === cur()">
            <span class="bar"><i [class.run]="i === cur() && playing()" [style.animation-duration.ms]="interval"></i></span>
            <span class="dot-label">{{ s.label }}</span>
          </button>
        }
      </div>
      <div class="btns">
        <button type="button" (click)="prev()" aria-label="Previous slide"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        <button type="button" (click)="paused.set(!paused())" [attr.aria-label]="paused() ? 'Play slideshow' : 'Pause slideshow'">
          @if (paused()) { <svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg> }
          @else { <svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor"/></svg> }
        </button>
        <button type="button" (click)="next()" aria-label="Next slide"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      </div>
    </div>
  </section>`,
  styleUrl: './hero-carousel.scss',
})
export class HeroCarousel {
  readonly interval = 6500;
  readonly slides: Slide[] = [
    { kind: 'photo', img: 'img/hero-lab.webp', mobile: 'img/hero-lab-m.webp', alt: 'A scientist measuring a sample with a pipette at a bench of burettes', focus: '22% 30%', align: 'right',
      label: 'Chitra Scientific Industries, Chennai', title: 'Equipment and supplies for every laboratory bench.',
      text: 'Instruments, glassware, chemicals and lab furniture for colleges, hospitals, research centres and industry — ISO 13485:2016 certified.',
      cta: { label: 'Browse the catalogue', link: '/products' } },
    { kind: 'photo', img: 'img/hero-instruments.webp', mobile: 'img/hero-instruments-m.webp', alt: 'A clinical laboratory with automated analysers along the wall', focus: '60% 55%',
      label: 'Instruments', title: 'Instruments installed and demonstrated by our team.',
      text: 'Microscopes, centrifuges, ovens, incubators and analysers — supplied, set up at your laboratory and supported after purchase.',
      cta: { label: 'Shop lab equipment', link: '/products/general-lab-equipment' } },
    { kind: 'photo', img: 'img/hero-chemicals.webp', mobile: 'img/hero-chemicals-m.webp', alt: 'A gloved hand holding a conical flask of blue solution', focus: '55% 40%',
      label: 'Chemicals & reagents', title: 'Laboratory chemicals and reagents, in stock.',
      text: 'AR and LR grade chemicals, stains, indicators and buffer solutions for practical classes, testing labs and research.',
      cta: { label: 'Shop chemicals', link: '/products/chemicals' } },
    { kind: 'photo', img: 'img/hero-glassware.webp', mobile: 'img/hero-glassware-m.webp', alt: 'A conical flask and a rack of test tubes on a laboratory bench', focus: '24% 60%', align: 'right',
      label: 'Glassware & consumables', title: 'Glassware and consumables for daily bench work.',
      text: 'Burettes, flasks, cylinders, filter papers and plasticware from Borosil, Schott Duran, Whatman and Tarsons.',
      cta: { label: 'Shop chemistry apparatus', link: '/products/chemistry-apparatus' } },
    { kind: 'photo', img: 'img/hero-hospital.webp', mobile: 'img/hero-hospital-m.webp', alt: 'Gloved hands holding a rack of blood sample tubes', focus: '60% 35%',
      label: 'For colleges & hospitals', title: 'Contract prices, purchase orders and credit terms.',
      text: 'Register your department once to see agreed prices, send formal quotations to your committee and order against a PO.',
      cta: { label: 'Register your institution', link: '/register' } },
  ];
  readonly cur = signal(0);
  readonly hold = signal(false);
  readonly paused = signal(false);
  private readonly ready = signal(false);
  readonly playing = computed(() => this.ready() && !this.hold() && !this.paused());
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => {
      this.ready.set(true);
    });
    // (re)start the countdown whenever the slide changes or playback resumes, so the progress bar and timer agree
    effect(() => {
      this.cur();
      const on = this.playing();
      clearTimeout(this.timer);
      if (on) this.schedule();
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }
  /** wait one interval; if the browser tab is in the background, wait again instead of advancing */
  private schedule(): void {
    this.timer = setTimeout(() => { if (document.hidden) this.schedule(); else this.next(); }, this.interval);
  }
  next(): void { this.cur.set((this.cur() + 1) % this.slides.length); }
  prev(): void { this.cur.set((this.cur() - 1 + this.slides.length) % this.slides.length); }
  go(i: number): void { this.cur.set(i); }
}
