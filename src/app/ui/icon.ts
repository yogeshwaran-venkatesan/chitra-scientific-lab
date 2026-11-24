import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { inject } from '@angular/core';
import type { IconName } from '../data/catalog-source';

// Hand-drawn 48×48 line icons (stroke = currentColor). No third-party artwork.
const P: Record<IconName | UiIcon, string> = {
  flask: '<path d="M19 6h10M21 6v12L10 38a3 3 0 0 0 2.6 4.5h22.8A3 3 0 0 0 38 38L27 18V6"/><path d="M14 30h20"/><circle cx="21" cy="35" r="1.5"/><circle cx="27" cy="33" r="1"/>',
  beaker: '<path d="M10 8h28M13 8v30a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8"/><path d="M13 24h22M18 14h4M18 19h6M18 29h4"/>',
  microscope: '<path d="M19 6l6 3-7 14-6-3z"/><path d="M15 23l-2 4M24 15a10 10 0 0 1 6 17"/><path d="M10 42h28M18 42v-5h12"/><path d="M20 30h8"/>',
  centrifuge: '<rect x="7" y="18" width="34" height="22" rx="3"/><path d="M11 18v-4a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v4"/><circle cx="24" cy="29" r="6"/><path d="M24 23v12M18 29h12"/><path d="M33 36h4"/>',
  crucible: '<path d="M10 18h28l-4 20a3 3 0 0 1-3 2.5H17a3 3 0 0 1-3-2.5z"/><path d="M8 18h32M18 12c0-3 2-4 2-6M26 12c0-3 2-4 2-6"/>',
  filter: '<path d="M8 10h32L27 26v14l-6-4V26z"/><path d="M14 16h20"/>',
  gel: '<rect x="8" y="12" width="32" height="26" rx="2"/><path d="M14 12v-4M20 12v-4M28 12v-4M34 12v-4"/><path d="M13 18h6M13 23h6M21 21h6M21 28h6M29 19h6M29 31h6"/>',
  petri: '<ellipse cx="24" cy="26" rx="17" ry="8"/><path d="M7 26v4c0 4.4 7.6 8 17 8s17-3.6 17-8v-4"/><circle cx="18" cy="25" r="2"/><circle cx="27" cy="27" r="1.5"/><circle cx="30" cy="23" r="1"/>',
  magnet: '<path d="M12 8v16a12 12 0 0 0 24 0V8h-7v16a5 5 0 0 1-10 0V8z"/><path d="M12 14h7M29 14h7"/>',
  pendulum: '<path d="M10 8h28M24 8l8 24"/><circle cx="33" cy="35" r="4"/>',
  kymograph: '<rect x="14" y="8" width="16" height="28" rx="2"/><path d="M8 42h32M22 36v6"/><path d="M14 16c4-3 6 3 10 0s6 3 6 0M14 26c3 2 5-4 8 0s6 2 8 0"/>',
  oven: '<rect x="7" y="8" width="34" height="30" rx="2"/><rect x="11" y="13" width="20" height="20" rx="1"/><path d="M36 15v2M36 22v2M10 42h4M34 42h4"/>',
  seed: '<path d="M24 42V22"/><path d="M24 26c-8 0-12-5-12-12 8 0 12 5 12 12z"/><path d="M24 22c0-7 4-12 12-12 0 7-4 12-12 12z"/><path d="M14 42h20"/>',
  furnace: '<rect x="9" y="10" width="30" height="30" rx="2"/><rect x="15" y="18" width="18" height="12" rx="1"/><path d="M20 26c0-3 2-3 2-5M26 26c0-3 2-3 2-5M15 36h18"/>',
  cloud: '<path d="M14 34h21a7 7 0 0 0 0-14 11 11 0 0 0-21-2 8 8 0 0 0 0 16z"/><path d="M17 40l-2 3M25 40l-2 3M33 40l-2 3"/>',
  grease: '<path d="M24 6c6 9 11 15 11 22a11 11 0 0 1-22 0c0-7 5-13 11-22z"/><path d="M19 30a5 5 0 0 0 5 5"/>',
  cooling: '<path d="M24 6v36M9 15l30 18M9 33l30-18"/><path d="M20 9l4 4 4-4M20 39l4-4 4 4"/>',
  oil: '<path d="M14 14h16l6 6v20a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2z"/><path d="M18 14V8h8v6M18 30h12"/>',
  road: '<path d="M16 42L21 6M32 42L27 6"/><path d="M24 10v4M24 20v5M24 31v6"/>',
  meter: '<path d="M8 32a16 16 0 0 1 32 0"/><path d="M24 32l8-10"/><circle cx="24" cy="32" r="2"/><path d="M12 32h-2M38 32h-2M14 22l-1.5-1.5M34 22l1.5-1.5M24 18v-2"/><path d="M8 38h32"/>',
  paint: '<rect x="8" y="8" width="26" height="12" rx="2"/><path d="M34 14h4v8H22v6"/><rect x="19" y="28" width="6" height="14" rx="1.5"/>',
  tablet: '<rect x="8" y="16" width="20" height="10" rx="5" transform="rotate(-35 18 21)"/><path d="M13 27l10-14"/><circle cx="34" cy="33" r="7"/><path d="M29 33h10"/>',
  weather: '<circle cx="18" cy="18" r="6"/><path d="M18 6v3M18 27v3M6 18h3M8 10l2 2M26 10l-2 2"/><path d="M22 38h15a5 5 0 0 0 0-10 7 7 0 0 0-13-1 5 5 0 0 0-2 11z"/>',
  soil: '<path d="M8 20h32M8 28h32M8 36h32"/><circle cx="14" cy="24" r="1"/><circle cx="26" cy="32" r="1.2"/><circle cx="33" cy="24" r="0.8"/><path d="M24 20V8M24 12l-4-3M24 15l4-3"/>',
  dna: '<path d="M16 6c0 12 16 12 16 24s-16 6-16 12M32 6c0 12-16 12-16 24s16 6 16 12"/><path d="M18 12h12M17 20h14M17 28h14M18 36h12"/>',
  slide: '<rect x="6" y="18" width="36" height="12" rx="1.5"/><rect x="18" y="20" width="12" height="8"/><circle cx="24" cy="24" r="2"/>',
  balance: '<path d="M24 8v32M14 40h20M10 14h28"/><path d="M10 14l-5 12h10zM38 14l-5 12h10z"/><circle cx="24" cy="8" r="2"/>',
  bottle: '<path d="M19 6h10v8l5 6v20a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V20l5-6z"/><rect x="17" y="24" width="14" height="10"/><path d="M20 29h8"/>',
  furniture: '<path d="M4 20h40M8 20v20M40 20v20M8 30h32"/><path d="M14 20v-6h6v6M30 20v-9a3 3 0 0 1 6 0"/>',
  tooth: '<path d="M16 8c-6 0-9 5-7 12 1 4 2 8 3 14 1 5 5 6 6-1l2-8h8l2 8c1 7 5 6 6 1 1-6 2-10 3-14 2-7-1-12-7-12-3 0-5 2-8 2s-5-2-8-2z"/>',
  // interface icons
  search: '<circle cx="21" cy="21" r="12"/><path d="M30 30l10 10"/>',
  basket: '<path d="M6 16h36l-4 22a3 3 0 0 1-3 2.5H13a3 3 0 0 1-3-2.5z"/><path d="M16 16l6-10M32 16l-6-10M18 24v10M24 24v10M30 24v10"/>',
  cart: '<path d="M4 8h6l5 24h24l4-16H13"/><circle cx="18" cy="40" r="3"/><circle cx="35" cy="40" r="3"/>',
  user: '<circle cx="24" cy="16" r="8"/><path d="M8 42c2-9 8-13 16-13s14 4 16 13"/>',
  whatsapp: '<path d="M8 40l3-9a16 16 0 1 1 6 6z"/><path d="M18 17c0 7 6 13 13 13l2-3-4-2-2 2c-3-1-5-3-6-6l2-2-2-4z"/>',
  phone: '<path d="M12 6h8l3 9-5 3c2 5 6 9 11 11l3-5 9 3v8a3 3 0 0 1-3 3C22 42 6 26 6 9a3 3 0 0 1 3-3z"/>',
  mail: '<rect x="6" y="10" width="36" height="28" rx="2"/><path d="M6 12l18 14 18-14"/>',
  pin: '<path d="M24 42s14-12 14-24a14 14 0 0 0-28 0c0 12 14 24 14 24z"/><circle cx="24" cy="18" r="5"/>',
  check: '<path d="M10 25l9 9 19-20"/>',
  close: '<path d="M12 12l24 24M36 12L12 36"/>',
  menu: '<path d="M8 14h32M8 24h32M8 34h32"/>',
  plus: '<path d="M24 10v28M10 24h28"/>',
  minus: '<path d="M10 24h28"/>',
  trash: '<path d="M8 12h32M18 12V7h12v5M12 12l2 28h20l2-28M20 18v16M28 18v16"/>',
  certificate: '<rect x="6" y="8" width="36" height="26" rx="2"/><path d="M12 16h18M12 22h12"/><circle cx="34" cy="30" r="6"/><path d="M31 35l-2 8 5-3 5 3-2-8"/>',
  building: '<path d="M8 42V10l16-4v36M24 16l16 4v22M4 42h40"/><path d="M13 16h4M13 24h4M13 32h4M30 26h4M30 34h4"/>',
  truck: '<path d="M4 12h24v20H4zM28 20h9l7 7v5H28z"/><circle cx="12" cy="36" r="4"/><circle cx="36" cy="36" r="4"/>',
  shield: '<path d="M24 6l16 6v10c0 10-7 17-16 20C15 39 8 32 8 22V12z"/><path d="M17 24l5 5 9-10"/>',
  arrow: '<path d="M10 24h28M28 14l10 10-10 10"/>',
  download: '<path d="M24 6v24M14 20l10 10 10-10M8 40h32"/>',
};

export type UiIcon =
  | 'search' | 'basket' | 'cart' | 'user' | 'whatsapp' | 'phone' | 'mail' | 'pin' | 'check' | 'close' | 'menu' | 'plus'
  | 'minus' | 'trash' | 'certificate' | 'building' | 'truck' | 'shield' | 'arrow' | 'download';

@Component({
  selector: 'cs-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg viewBox="0 0 48 48" [attr.width]="size()" [attr.height]="size()" fill="none" stroke="currentColor"
      [attr.stroke-width]="weight()" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" [innerHTML]="svg()"></svg>`,
  styles: [':host{display:inline-flex;line-height:0}'],
})
export class Icon {
  private readonly san = inject(DomSanitizer);
  readonly name = input.required<IconName | UiIcon>();
  readonly size = input<number>(24);
  readonly weight = input<number>(2.4);
  // static, hard-coded markup above — never user input
  readonly svg = computed(() => this.san.bypassSecurityTrustHtml(P[this.name()] ?? ''));
}
