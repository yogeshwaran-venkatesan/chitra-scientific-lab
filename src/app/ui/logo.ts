import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The company's own logo mark (taken from their catalogue) with the wordmark in their two brand colours. */
@Component({
  selector: 'cs-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img src="img/logo-mark.webp" [attr.width]="size()" [attr.height]="size()" alt="" />
    @if (wordmark()) {
      <span class="wm" [class.light]="light()"><b>Chitra Scientific</b><em>Industries</em></span>
    }`,
  styles: [`
    :host { display: inline-flex; align-items: center; gap: 10px; }
    img { object-fit: contain; display: block; }
    .wm { display: grid; line-height: 1.05; }
    .wm b { font-family: var(--display); font-weight: 600; font-size: 1.2rem; letter-spacing: -.01em; color: var(--teal); white-space: nowrap; }
    @media (max-width: 400px) { .wm b { font-size: 1.05rem; } }
    .wm em { font-style: normal; font-family: var(--font); font-size: .68rem; font-weight: 600; letter-spacing: .14em; color: var(--maroon); text-transform: uppercase; margin-top: 2px; }
    .wm.light b { color: #fff; } .wm.light em { color: #e8b4b9; }
  `],
})
export class Logo {
  readonly size = input(40);
  readonly wordmark = input(true);
  readonly light = input(false);
  /** kept for older call sites */
  readonly dark = input(false);
}
