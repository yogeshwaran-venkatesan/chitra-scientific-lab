// Builds the prototype catalogue from catalog-source.ts. Every price, brand, stock level and spec here
// is a deterministic SAMPLE so the demo looks the same on every visit — the real data comes from the company.

import { CATEGORY_SOURCE, CategorySource, ENQUIRY_ONLY, GROUPS, IconName } from './catalog-source';

export type StockState = 'in' | 'low' | 'order';

export interface Category {
  slug: string;
  name: string;
  group: string;
  icon: IconName;
  blurb: string;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  group: string;
  icon: IconName;
  sku: string;
  brand: string;
  /** rupees, before GST */
  price: number;
  gstPct: number;
  hsn: string;
  stock: StockState;
  enquiryOnly: boolean;
  pack: string;
  description: string;
  specs: Array<[string, string]>;
}

/** small deterministic hash → [0, 1) */
function rand(seed: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/['’]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ICON_RULES: Array<[RegExp, IconName]> = [
  [/stirrer|shaker|mixer/i, 'beaker'],
  [/microscope|eyepiece|camera lucida|oil immersion/i, 'microscope'],
  [/centrifuge/i, 'centrifuge'],
  [/balance|weights?\b|weight box|weighing/i, 'balance'],
  [/beaker|cylinder|jar|trough|bowl|basin|dish|tray/i, 'beaker'],
  [/bottle|carboy|vial|reagent|winchester|chemical|acid|solution|powder|salt|agar|stain|indicator|tablets|pellets|ethanol|methanol|acetone|peroxide|formaldehyde|permanganate|sulphate|nitrate|chloride|dichromate|edta/i, 'bottle'],
  [/flask|retort/i, 'flask'],
  [/filter|funnel|membrane|thimble/i, 'filter'],
  [/thermometer|meter\b|meters|gauge|photometer|analy[sz]er|titrator|ph |conductivity|spectro|colorimeter|refracto|polari|calorimeter|galvanometer|ammeter|voltmeter/i, 'meter'],
  [/oven|incubator|furnace|autoclave|sterili[sz]er|bath|cabinet|chamber|freezer|dryer|hood/i, 'oven'],
  [/slide|cover slip/i, 'slide'],
  [/petri|colony|culture|agar plate/i, 'petri'],
  [/crucible|capsule/i, 'crucible'],
  [/magnet|compass|needle/i, 'magnet'],
  [/pendulum|pulley|bob/i, 'pendulum'],
  [/viscometer|flash point|grease|wax|oil/i, 'oil'],
  [/model|skeleton|torso|heart|brain|eye|ear|chart/i, 'slide'],
  [/bench|stool|table|furniture|trolley|couch|bed|sink/i, 'furniture'],
];
const iconFor = (name: string, fallback: IconName): IconName => ICON_RULES.find(([re]) => re.test(name))?.[1] ?? fallback;

/** Realistic sample prices for items that appear in the demo story (₹ before GST). */
const PRICE_HINTS: Record<string, number> = {
  'magnetic-stirrer': 6500, 'water-bath': 9500, micropipettes: 6200, 'separating-funnels': 650, 'hot-air-oven': 17500,
  'clinical-centrifuge': 24000, 'uv-vis-spectrophotometer': 285000, 'physics-charts-set': 1800, 'vernier-calipers': 350,
  'screw-gauge': 280, 'meter-bridge': 1450, slides: 180, 'cover-slips': 120, 'student-microscope': 5500, 'ph-meter': 10000,
  'analytical-weighing-balance': 78000, desiccators: 2250, burettes: 2450, 'conical-flasks': 1100, beakers: 235, pipettes: 320,
  'compound-microscope': 14500, 'research-binocular-microscope': 68000, 'laboratory-centrifuge': 18500, incubator: 32000,
  autoclave: 28500, 'digital-ph-meter': 9800, 'top-pan-balance': 14500, 'muffle-furnace': 42000, 'colorimeter': 16500,
};

/** price inside the band, skewed towards the low end, rounded like a real price list */
function samplePrice(name: string, band: [number, number]): number {
  const [lo, hi] = band;
  const r = Math.pow(rand(name, 7), 2.2);
  const p = lo + (hi - lo) * r;
  const step = p < 500 ? 5 : p < 5000 ? 50 : p < 50000 ? 500 : 5000;
  return Math.max(lo, Math.round(p / step) * step);
}

const PACKS: Record<string, string[]> = {
  'chemistry-apparatus': ['Pack of 1', 'Pack of 6', 'Pack of 12', 'Each'],
  'plastic-ware': ['Pack of 10', 'Pack of 100', 'Pack of 500', 'Each'],
  'filter-papers': ['Box of 100', 'Pack of 50', 'Ream of 500 sheets'],
  chemicals: ['Bottle'],
};

const HSN: Record<string, string> = {
  'Glassware & labware': '7017', 'Life sciences': '9011', 'Physics & engineering': '9023', 'Instruments & meters': '9027',
  'Industrial testing': '9024', Chemicals: '2827', 'Teaching aids & furniture': '9403',
};

function specsFor(c: CategorySource, name: string, brand: string): Array<[string, string]> {
  const s: Array<[string, string]> = [['Brand', brand], ['Model', `${brand.slice(0, 3).toUpperCase()}-${100 + Math.floor(rand(name, 3) * 900)}`]];
  if (c.group === 'Glassware & labware') s.push(['Material', c.slug === 'plastic-ware' ? 'Polypropylene, autoclavable' : 'Borosilicate glass 3.3'], ['Graduation', 'Printed, permanent']);
  else if (c.group === 'Chemicals') s.push(['Grade', name.includes('HPLC') ? 'HPLC' : 'AR / ACS'], ['Storage', 'Cool, dry place']);
  else if (c.group === 'Teaching aids & furniture') s.push(['Finish', 'Durable, lab grade'], ['Installation', c.slug === 'lab-furniture' ? 'Included in Chennai' : 'Not required']);
  else s.push(['Power', rand(name, 5) > 0.3 ? '230 V AC, 50 Hz' : 'Not required'], ['Body', 'Powder-coated mild steel / SS'], ['Warranty', `${rand(name, 9) > 0.5 ? 1 : 2} year`]);
  s.push(['Country of origin', brand === 'Imported' ? 'Imported' : 'India']);
  return s;
}

/**
 * Prototype showcase (decided 24 Nov 2026): only categories with a real photo from the client's catalogue,
 * up to 8 products each. The full list (catalog-source.ts) is loaded after the client approves.
 */
export const CATEGORY_PHOTO: Record<string, string> = {
  'chemistry-apparatus': 'img/cat-glassware.webp', chemicals: 'img/cat-chemicals.webp', 'plastic-ware': 'img/cat-plasticware.webp',
  balances: 'img/cat-balances.webp', 'physics-apparatus': 'img/cat-physics.webp', 'microbiology-pathology': 'img/cat-microbiology.webp',
  pharmaceutical: 'img/cat-pharma.webp', 'general-lab-equipment': 'img/cat-instruments.webp', 'teaching-aids': 'img/cat-models.webp',
  'lab-furniture': 'img/cat-furniture.webp',
};
const PER_CATEGORY = 8;
/** always shown — used by the demo orders, quotations and home page */
const MUST = new Set(['burettes', 'conical-flasks', 'pipettes', 'beakers', 'desiccators', 'separating-funnels', 'measuring-cylinders',
  'water-bath', 'hot-air-oven', 'kjeldahl-distillation-apparatus', 'magnetic-stirrer', 'polypropylene-beakers', 'wash-bottles-ldpe',
  'micropipette-tips', 'analytical-weighing-balance', 'physics-charts-set', 'vernier-calipers', 'screw-gauge', 'meter-bridge',
  'human-skeleton-full-size', 'tablet-hardness-tester', 'hydrochloric-acid-35-2-5-l', 'sodium-chloride-ar-500-g']);

function build(): { categories: Category[]; products: Product[] } {
  const categories: Category[] = [];
  const products: Product[] = [];
  const seen = new Set<string>();
  for (const c of CATEGORY_SOURCE.filter((x) => CATEGORY_PHOTO[x.slug])) {
    const names = c.items.split('|').map((x) => x.trim()).filter(Boolean);
    let n = 0;
    names.forEach((name, i) => {
      let slug = slugify(name);
      if (seen.has(slug)) slug = `${slug}-${c.slug.split('-')[0]}`;
      if (seen.has(slug)) return;
      if (n >= PER_CATEGORY && !MUST.has(slug)) return;
      seen.add(slug);
      n++;
      const brand = c.brands[Math.floor(rand(name, 1) * c.brands.length)];
      const enquiryOnly = c.slug === 'chemicals' ? ENQUIRY_ONLY.test(name) : (PRICE_HINTS[slugify(name)] ?? samplePrice(name, c.band)) > 150000;
      const sr = rand(name, 2);
      const packs = PACKS[c.slug] ?? ['Each'];
      products.push({
        id: `${c.slug}-${i}`,
        slug,
        name,
        category: c.slug,
        categoryName: c.name,
        group: c.group,
        icon: iconFor(name, c.icon),
        sku: `CSI-${c.slug.slice(0, 3).toUpperCase()}-${String(1000 + i * 7 + Math.floor(rand(name) * 7)).padStart(4, '0')}`,
        brand,
        price: PRICE_HINTS[slug] ?? samplePrice(name, c.band),
        gstPct: 18,
        hsn: HSN[c.group] ?? '9027',
        stock: sr > 0.25 ? 'in' : sr > 0.1 ? 'low' : 'order',
        enquiryOnly,
        pack: packs[Math.floor(rand(name, 4) * packs.length)],
        description: `${name} from ${brand}, supplied by Chitra Scientific for teaching, research and quality control laboratories. ${c.blurb}`,
        specs: specsFor(c, name, brand),
      });
    });
    categories.push({ slug: c.slug, name: c.name, group: c.group, icon: c.icon, blurb: c.blurb, count: n });
  }
  return { categories, products };
}

const BUILT = build();
export const CATEGORIES: Category[] = BUILT.categories;
export const PRODUCTS: Product[] = BUILT.products;
export const PRODUCT_COUNT = PRODUCTS.length;
export const CATEGORY_GROUPS = GROUPS.map((g) => ({ name: g as string, categories: CATEGORIES.filter((c) => c.group === g) })).filter((g) => g.categories.length);
export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort();

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

/** Forgiving search: every word must match the start of a word in name / brand / category; small typos tolerated. */
export function searchProducts(q: string, limit = 200, list: Product[] = PRODUCTS): Product[] {
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  if (!words.length) return [];
  const scored: Array<[number, Product]> = [];
  for (const p of list) {
    const hay = `${p.name} ${p.brand} ${p.categoryName} ${p.sku}`.toLowerCase();
    const tokens = hay.split(/[^a-z0-9]+/);
    let score = 0;
    let ok = true;
    for (const w of words) {
      if (hay.includes(w)) score += tokens.some((t) => t.startsWith(w)) ? 3 : 1;
      else if (w.length >= 4 && tokens.some((t) => near(t, w))) score += 1;
      else { ok = false; break; }
    }
    if (ok) scored.push([score + (p.name.toLowerCase().startsWith(words[0]) ? 2 : 0), p]);
  }
  return scored.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name)).slice(0, limit).map((x) => x[1]);
}

/** one edit (or a swapped pair) apart, comparing the word with the token's same-length prefix */
function near(token: string, w: string): boolean {
  const t = token.slice(0, w.length + 1);
  if (Math.abs(t.length - w.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < t.length && j < w.length) {
    if (t[i] === w[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (t[i + 1] === w[j] && t[i] === w[j + 1]) { i += 2; j += 2; continue; }
    if (t.length > w.length) i++; else if (w.length > t.length) j++; else { i++; j++; }
  }
  return edits + (t.length - i) + (w.length - j) <= 1 || t.startsWith(w.slice(0, -1));
}

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: n % 1 ? 2 : 0 });
