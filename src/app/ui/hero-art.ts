import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Signature hero illustration: lit laboratory glassware with coloured reagents (hand-drawn SVG, no stock art).
 * Liquid surfaces sway and bubbles rise; all motion stops under prefers-reduced-motion.
 */
@Component({
  selector: 'cs-hero-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <svg viewBox="0 0 560 520" role="img" aria-label="Laboratory glassware with coloured reagents">
    <defs>
      <radialGradient id="ha-glow1" gradientUnits="userSpaceOnUse" cx="250" cy="330" r="170"><stop offset="0" stop-color="#F4A938" stop-opacity=".35"/><stop offset="1" stop-color="#F4A938" stop-opacity="0"/></radialGradient>
      <radialGradient id="ha-glow2" gradientUnits="userSpaceOnUse" cx="420" cy="340" r="130"><stop offset="0" stop-color="#4FD1C0" stop-opacity=".35"/><stop offset="1" stop-color="#4FD1C0" stop-opacity="0"/></radialGradient>
      <linearGradient id="ha-amber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFCB6B"/><stop offset=".55" stop-color="#F4A938"/><stop offset="1" stop-color="#D9661F"/></linearGradient>
      <linearGradient id="ha-teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FF0DF"/><stop offset=".6" stop-color="#22A99F"/><stop offset="1" stop-color="#0B5E5C"/></linearGradient>
      <linearGradient id="ha-mag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8CC0"/><stop offset="1" stop-color="#A62764"/></linearGradient>
      <linearGradient id="ha-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".35" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".09"/></linearGradient>
      <linearGradient id="ha-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".4" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="ha-floor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8BE3D6" stop-opacity="0"/><stop offset=".5" stop-color="#8BE3D6" stop-opacity=".45"/><stop offset="1" stop-color="#8BE3D6" stop-opacity="0"/></linearGradient>
      <clipPath id="ha-c-flask"><path d="M229 74V190L150 390Q143 413 166 414H334Q357 413 350 390L271 190V74Z"/></clipPath>
      <clipPath id="ha-c-round"><path d="M410 128V280A78 78 0 1 0 438 280V128Z"/></clipPath>
      <clipPath id="ha-c-beaker"><path d="M70 296H190V430Q190 444 176 444H84Q70 444 70 430Z"/></clipPath>
      <clipPath id="ha-c-t1"><rect x="96" y="150" width="20" height="132" rx="10"/></clipPath>
      <clipPath id="ha-c-t2"><rect x="126" y="150" width="20" height="132" rx="10"/></clipPath>
      <clipPath id="ha-c-t3"><rect x="156" y="150" width="20" height="132" rx="10"/></clipPath>
    </defs>

    <rect width="560" height="520" fill="url(#ha-glow1)"/>
    <rect width="560" height="520" fill="url(#ha-glow2)"/>

    <!-- floor + reflections -->
    <ellipse cx="270" cy="448" rx="250" ry="14" fill="#000" opacity=".28"/>
    <rect x="20" y="446" width="520" height="1.5" fill="url(#ha-floor)"/>

    <!-- test tubes in a rack (behind) -->
    <g>
      <g clip-path="url(#ha-c-t1)"><rect x="96" y="210" width="20" height="80" fill="url(#ha-teal)"/></g>
      <g clip-path="url(#ha-c-t2)"><rect x="126" y="236" width="20" height="60" fill="url(#ha-amber)"/></g>
      <g clip-path="url(#ha-c-t3)"><rect x="156" y="196" width="20" height="96" fill="url(#ha-mag)"/></g>
      @for (x of [96, 126, 156]; track x) {
        <rect [attr.x]="x" y="150" width="20" height="132" rx="10" fill="url(#ha-glass)" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/>
        <rect [attr.x]="x + 4" y="160" width="3" height="100" rx="1.5" fill="url(#ha-shine)"/>
      }
      <rect x="84" y="186" width="106" height="10" rx="3" fill="#0E3A3D" stroke="#fff" stroke-opacity=".25"/>
      <rect x="88" y="196" width="4" height="96" fill="#0E3A3D"/><rect x="182" y="196" width="4" height="96" fill="#0E3A3D"/>
    </g>

    <!-- round-bottom flask (right) -->
    <g>
      <g clip-path="url(#ha-c-round)">
        <g class="sway sway-b"><path d="M300 334q22-7 44 0t44 0 44 0 44 0 44 0 44 0V460H300Z" fill="url(#ha-teal)"/></g>
      </g>
      <path d="M410 128V280A78 78 0 1 0 438 280V128" fill="url(#ha-glass)" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>
      <path d="M404 128H444" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
      <path d="M372 318a58 58 0 0 1 22-30" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>
      <rect x="415" y="138" width="3" height="120" rx="1.5" fill="url(#ha-shine)"/>
      <g class="bubbles b2"><circle cx="420" cy="410" r="3" fill="#fff" fill-opacity=".7"/><circle cx="436" cy="420" r="2" fill="#fff" fill-opacity=".6"/><circle cx="408" cy="425" r="1.6" fill="#fff" fill-opacity=".6"/></g>
    </g>

    <!-- conical flask (centre) -->
    <g>
      <g clip-path="url(#ha-c-flask)">
        <g class="sway"><path d="M60 298q25-9 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0V440H60Z" fill="url(#ha-amber)"/></g>
        <path d="M60 298q25-9 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0" class="sway" fill="none" stroke="#FFE2A8" stroke-opacity=".7" stroke-width="2"/>
      </g>
      <path d="M229 74V190L150 390Q143 413 166 414H334Q357 413 350 390L271 190V74" fill="url(#ha-glass)" stroke="#fff" stroke-opacity=".6" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M222 74H278" stroke="#fff" stroke-opacity=".75" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M236 96V196L176 352" fill="none" stroke="url(#ha-shine)" stroke-width="5" stroke-linecap="round"/>
      @for (y of [330, 352, 374]; track y) { <path [attr.d]="'M' + (300 + (y - 330) * .36) + ' ' + y + 'h-18'" stroke="#fff" stroke-opacity=".45" stroke-width="1.4"/> }
      <g class="bubbles"><circle cx="232" cy="396" r="4" fill="#fff" fill-opacity=".75"/><circle cx="262" cy="404" r="2.6" fill="#fff" fill-opacity=".6"/><circle cx="248" cy="410" r="1.8" fill="#fff" fill-opacity=".7"/><circle cx="280" cy="398" r="2.2" fill="#fff" fill-opacity=".55"/></g>
    </g>

    <!-- beaker (front left) -->
    <g>
      <g clip-path="url(#ha-c-beaker)">
        <g class="sway sway-c"><path d="M20 382q20-6 40 0t40 0 40 0 40 0 40 0 40 0V460H20Z" fill="url(#ha-mag)"/></g>
      </g>
      <path d="M64 292H196M70 296V430Q70 444 84 444H176Q190 444 190 430V296" fill="url(#ha-glass)" stroke="#fff" stroke-opacity=".6" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M64 292q-6 0-6 6" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.2"/>
      @for (y of [320, 345, 370, 395, 420]; track y) { <path [attr.d]="'M190 ' + y + 'h-' + ($index % 2 ? 10 : 18)" stroke="#fff" stroke-opacity=".5" stroke-width="1.4"/> }
      <rect x="78" y="304" width="4" height="122" rx="2" fill="url(#ha-shine)"/>
    </g>

    <!-- a drop falling into the flask -->
    <g class="drop"><path d="M250 20c4 8 7 12 7 16a7 7 0 0 1-14 0c0-4 3-8 7-16Z" fill="#FFCB6B"/></g>
  </svg>`,
  styles: [`
    :host { display: block; }
    svg { width: 100%; height: auto; overflow: visible; }
    .sway { animation: sway 6s linear infinite; }
    .sway-b { animation-duration: 7.5s; }
    .sway-c { animation-duration: 5s; }
    @keyframes sway { from { transform: translateX(0); } to { transform: translateX(-100px); } }
    .sway-b { animation-name: swayb; } @keyframes swayb { from { transform: translateX(0); } to { transform: translateX(-88px); } }
    .sway-c { animation-name: swayc; } @keyframes swayc { from { transform: translateX(0); } to { transform: translateX(-80px); } }
    .bubbles circle { animation: rise 4.5s ease-in infinite; transform-box: fill-box; }
    .bubbles circle:nth-child(2) { animation-delay: 1.2s; } .bubbles circle:nth-child(3) { animation-delay: 2.4s; } .bubbles circle:nth-child(4) { animation-delay: 3.1s; }
    .b2 circle { animation-duration: 5.5s; }
    @keyframes rise { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-90px); opacity: 0; } }
    .drop { animation: drop 3.2s cubic-bezier(.5, 0, .9, .6) infinite; }
    @keyframes drop { 0%, 55% { transform: translateY(0); opacity: 0; } 60% { opacity: 1; } 95% { transform: translateY(250px); opacity: 1; } 100% { transform: translateY(262px); opacity: 0; } }
  `],
})
export class HeroArt {}
