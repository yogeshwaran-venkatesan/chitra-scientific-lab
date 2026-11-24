import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../data/catalog';
import { CERTIFICATES, COMPANY, INDUSTRIES, STOCKED_BRANDS, UNITS } from '../data/company';
import { Icon } from '../ui/icon';

const SHARED = `
  .lead { font-size: var(--step-1); color: var(--muted); max-width: 60ch; }
  .cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
  .list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); }
  .cell { background: var(--paper); padding: 20px; display: grid; gap: 6px; align-content: start; }
  .cell cs-icon { color: var(--petrol); }
  .cell span { color: var(--muted); font-size: .92rem; }
  .cta-band { margin-top: 48px; background: var(--petrol); color: #e8f2f1; border-radius: var(--radius-m); padding: 28px 32px; display: flex; justify-content: space-between; gap: 20px; align-items: center; flex-wrap: wrap; }
  .cta-band h2 { color: #fff; margin: 0 0 4px; font-size: 1.5rem; }
  .cta-band p { margin: 0; }
  @media (max-width: 900px) { .cols2 { grid-template-columns: 1fr; } .list { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .list { grid-template-columns: 1fr; } }
`;

@Component({
  selector: 'cs-industries', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, Icon], styles: [SHARED],
  template: `
  <div class="wrap page-head"><nav class="crumbs"><a routerLink="/">Home</a> / <span>Industries we serve</span></nav>
    <h1>Industries we serve</h1><p class="lead">Teaching laboratories, R&amp;D centres and quality-control labs across education, healthcare, government and industry.</p></div>
  <div class="wrap">
    <div class="list">@for (x of industries; track x.name) { <div class="cell"><cs-icon [name]="$any(x.icon)" [size]="32" [weight]="1.8" /><b>{{ x.name }}</b><span>{{ x.note }}</span></div> }</div>
    <div class="cta-band"><div><h2>Equipping a department or a new lab?</h2><p>Send your list — we quote everything together, with contract pricing for institutions.</p></div><a class="btn btn-primary" routerLink="/quote">Request a quotation</a></div>
  </div>`,
})
export class Industries { readonly industries = INDUSTRIES; }

@Component({
  selector: 'cs-about', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink],
  styles: [SHARED + `.policy { border-left: 4px solid var(--petrol); padding: 6px 0 6px 20px; font-size: 1.15rem; line-height: 1.6; max-width: 60ch; margin: 0; }
    .units { columns: 2; padding-left: 18px; } .units li { margin-bottom: 6px; } .sign { color: var(--muted); margin-top: 10px; }`],
  template: `
  <div class="wrap page-head"><nav class="crumbs"><a routerLink="/">Home</a> / <span>About us</span></nav>
    <h1>About Chitra Scientific</h1><p class="lead">{{ c.line }}. Based in Valasaravakkam, Chennai, supplying teaching, analytical and research laboratories.</p></div>
  <div class="wrap cols2">
    <div>
      <h2>What we do</h2>
      <p>We manufacture laboratory instruments and stock glassware, filter papers, silica, porcelain, polythene and nickel ware, slides, specimens and other lab accessories, including furniture — for teaching, analytical and research laboratories.</p>
      <p>We also deal in commercial chemicals and acids in bulk, design and commission complete laboratories, and supply imported weather stations.</p>
      <p class="demo-note">Company history, founding year, team and premises photos to be added from the client.</p>
      <h2 style="margin-top:32px">Quality policy</h2>
      <blockquote class="policy">{{ c.quality }}</blockquote>
      <p class="sign">— {{ c.leader.name }}, {{ c.leader.title }}</p>
    </div>
    <div class="panel">
      <h2>Our units — Yogatharana &amp; KitVA</h2>
      <p class="muted">Specialised product lines under the Yogatharana brand:</p>
      <ul class="units">@for (u of units; track u) { <li>{{ u }}</li> }</ul>
    </div>
  </div>`,
})
export class About { readonly c = COMPANY; readonly units = UNITS; }

@Component({
  selector: 'cs-certs', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, Icon],
  styles: [SHARED + `.cert { display: grid; grid-template-columns: auto 1fr auto; gap: 18px; align-items: start; padding: 20px 0; border-bottom: 1px solid var(--line); }
    .cert cs-icon { color: var(--petrol); } .cert p { margin: 4px 0 0; color: var(--muted); }
    .status { font-size: .82rem; font-weight: 600; color: var(--amber-deep); background: rgba(227,161,59,.12); padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
    @media (max-width: 640px) { .cert { grid-template-columns: auto 1fr; } .status { grid-column: 2; justify-self: start; } }`],
  template: `
  <div class="wrap page-head"><nav class="crumbs"><a routerLink="/">Home</a> / <span>Certifications</span></nav>
    <h1>Certifications &amp; registrations</h1><p class="lead">Every certificate on this page links to a downloadable copy with its validity date.</p></div>
  <div class="wrap">
    @for (x of certs; track x.name) {
      <div class="cert"><cs-icon name="certificate" [size]="36" [weight]="1.8" /><div><b>{{ x.name }}</b><p>{{ x.scope }}</p><p class="small">Issued by {{ x.by }}</p></div><span class="status">{{ x.status }}</span></div>
    }
    <p class="demo-note" style="margin-top:20px">Prototype: the certificates in the 2023 profile have expired. Current copies are needed from the client before launch.</p>
  </div>`,
})
export class Certifications { readonly certs = CERTIFICATES; }

@Component({
  selector: 'cs-brands', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink],
  styles: [SHARED + `.grp { margin-bottom: 30px; } .chips { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip { background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius-s); padding: 10px 16px; font-weight: 650; font-stretch: 108%; }`],
  template: `
  <div class="wrap page-head"><nav class="crumbs"><a routerLink="/">Home</a> / <span>Brands</span></nav>
    <h1>Brands we stock</h1><p class="lead">Authorised stockists and suppliers for leading Indian and international laboratory brands.</p></div>
  <div class="wrap">
    @for (g of groups; track g[0]) { <section class="grp"><h2 class="h3">{{ g[0] }}</h2><div class="chips">@for (b of g[1]; track b) { <span class="chip">{{ b }}</span> }</div></section> }
    <p class="demo-note">Brand names are shown as text only. Logos can be added where the company has permission from the brand.</p>
  </div>`,
})
export class Brands { readonly groups = Object.entries(STOCKED_BRANDS); }

@Component({
  selector: 'cs-furnish', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, Icon],
  styles: [SHARED + `.steps { list-style: none; counter-reset: s; padding: 0; margin: 0; display: grid; gap: 0; border-left: 2px solid var(--petrol); }
    .steps li { counter-increment: s; padding: 0 0 22px 22px; position: relative; } .steps li::before { content: counter(s); position: absolute; left: -15px; top: -2px; width: 28px; height: 28px; border-radius: 50%; background: var(--petrol); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: .85rem; }
    .steps b { display: block; } .steps span { color: var(--muted); }
    .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
    .shot { aspect-ratio: 4/3; background: var(--paper); border: 1px dashed var(--line); border-radius: var(--radius-m); display: grid; place-items: center; color: var(--muted); font-size: .85rem; text-align: center; padding: 10px; }`],
  template: `
  <div class="wrap page-head"><nav class="crumbs"><a routerLink="/">Home</a> / <span>Lab furnishing</span></nav>
    <h1>Lab furnishing &amp; commissioning</h1><p class="lead">From an empty room to a working laboratory: layout, benches, fume cupboards, services and every instrument — designed, supplied and installed.</p></div>
  <div class="wrap cols2">
    <div>
      <h2>How a lab project runs</h2>
      <ol class="steps">
        <li><b>Site visit &amp; requirement</b><span>Room size, number of students or analysts, services (water, gas, power, exhaust).</span></li>
        <li><b>Layout drawing &amp; quotation</b><span>Bench layout, materials and a complete equipment list in one quotation.</span></li>
        <li><b>Manufacture &amp; supply</b><span>Furniture made to size; instruments and glassware supplied together.</span></li>
        <li><b>Installation &amp; commissioning</b><span>Fitting, plumbing and exhaust connections, instrument installation and demonstration.</span></li>
        <li><b>Handover &amp; support</b><span>Training for lab staff, warranty and service contact.</span></li>
      </ol>
    </div>
    <div class="panel">
      <h2>What we furnish</h2>
      <div class="list" style="grid-template-columns:1fr 1fr">
        @for (x of items; track x) { <div class="cell"><cs-icon name="furniture" [size]="26" [weight]="1.8" /><b>{{ x }}</b></div> }
      </div>
    </div>
  </div>
  <div class="wrap">
    <h2 style="margin-top:44px">Recent projects</h2>
    <div class="gallery">@for (i of [1,2,3]; track i) { <div class="shot">Project photo {{ i }} from Chitra Scientific</div> }</div>
    <div class="cta-band"><div><h2>Plan your laboratory with us</h2><p>Share the room size and the subjects taught — we send a layout and quotation.</p></div><a class="btn btn-primary" routerLink="/contact">Book a site visit</a></div>
  </div>`,
})
export class LabFurnishing {
  readonly items = ['Island & wall benches', 'Fume cupboards', 'Laminar flow stations', 'Sinks & drain boards', 'Reagent & storage cabinets', 'Hospital & clinical furniture'];
}

@Component({
  selector: 'cs-contact', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, FormsModule, Icon],
  styles: [SHARED + `.ways { display: grid; gap: 16px; } .way { display: flex; gap: 14px; align-items: flex-start; } .way cs-icon { color: var(--petrol); margin-top: 2px; }
    .way a { display: block; } .map { width: 100%; height: 300px; border: 1px solid var(--line); border-radius: var(--radius-m); margin-top: 18px; background: var(--paper); }
    .err { font-size: var(--step--1); color: var(--litmus); font-weight: 600; } .ok { color: var(--ok); font-weight: 600; display: flex; gap: 8px; align-items: center; }`],
  template: `
  <div class="wrap page-head"><nav class="crumbs"><a routerLink="/">Home</a> / <span>Contact</span></nav>
    <h1>Contact us</h1><p class="lead">Call, write or visit. For product prices, the quote basket is the fastest way.</p></div>
  <div class="wrap cols2">
    <div class="ways">
      <div class="way"><cs-icon name="pin" /><div><b>Office</b><br>@for (l of c.address; track l) { {{ l }}<br> }</div></div>
      <div class="way"><cs-icon name="phone" /><div><b>Phone</b>@for (p of c.phones; track p) { <a [href]="'tel:+91' + p.split(' ').join('')">{{ p }}</a> }</div></div>
      <div class="way"><cs-icon name="mail" /><div><b>Email</b>@for (e of c.emails; track e) { <a [href]="'mailto:' + e">{{ e }}</a> }</div></div>
      <iframe class="map" title="Map to Chitra Scientific Industries" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=Venkatasubramania+Samy+Nagar+Valasaravakkam+Chennai+600087&output=embed"></iframe>
    </div>
    <form class="panel" (ngSubmit)="send()" novalidate>
      <h2 class="h3">Send a message</h2>
      @if (sent()) { <p class="ok"><cs-icon name="check" [size]="20" /> Message sent. We reply within one working day.</p> }
      <div class="field"><label for="cn">Name</label><input id="cn" type="text" name="n" [(ngModel)]="m.name" /></div>
      <div class="field"><label for="cp">Mobile or email</label><input id="cp" type="text" name="p" [(ngModel)]="m.contact" /></div>
      <div class="field"><label for="cm">Message</label><textarea id="cm" name="m" [(ngModel)]="m.text" maxlength="1000"></textarea></div>
      @if (error()) { <p class="err">{{ error() }}</p> }
      <button class="btn btn-primary" type="submit">Send message</button>
    </form>
  </div>`,
})
export class Contact {
  readonly c = COMPANY;
  readonly sent = signal(false);
  readonly error = signal('');
  m = { name: '', contact: '', text: '' };
  send(): void {
    if (this.m.name.trim().length < 2 || this.m.contact.trim().length < 6 || this.m.text.trim().length < 5) {
      this.error.set('Fill in your name, a mobile number or email, and your message.');
      return;
    }
    this.error.set(''); this.sent.set(true); this.m = { name: '', contact: '', text: '' };
  }
}

@Component({
  selector: 'cs-not-found', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink],
  template: `<div class="wrap page-head"><h1>Page not found</h1><p>The page you opened does not exist. Try search above, or go to <a routerLink="/products">all products</a>.</p></div>`,
})
export class NotFound {}

export const CAT_COUNT = CATEGORIES.length;
