/** Soft background tint per product group for "specimen tiles" (until real photos arrive). */
const TINTS: Record<string, [string, string]> = {
  'Glassware & labware': ['#e3f3f1', '#0e7c7b'],
  'Life sciences': ['#e6f4e9', '#257a46'],
  'Physics & engineering': ['#e8ecfb', '#3a4fa8'],
  'Instruments & meters': ['#e5eff6', '#245b85'],
  'Industrial testing': ['#fbf0de', '#9a5d0c'],
  Chemicals: ['#fbe8f0', '#a3295f'],
  'Teaching aids & furniture': ['#f1ede6', '#6b5532'],
};
export const tint = (group: string): [string, string] => TINTS[group] ?? ['#e8f4f2', '#0e7c7b'];
