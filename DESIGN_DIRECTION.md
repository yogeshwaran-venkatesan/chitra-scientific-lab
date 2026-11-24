# Design direction — Chitra Scientific (v3, 24 Nov 2026)

## Client feedback that shaped v3
- v1 "looks old and simple"; v2 "looks AI-generated — big slogan on the left, glows, illustrations".
- Use the company's **own logo** and the **real photograph** (technician at a microscope) from their catalogue.
- Use real images; proper fonts; build **trust and positivity**; show a selection of products, not everything.
- References: the calm, editorial restraint of Anthropic's site and the precision of Vercel's (studied for quality, not copied).

## Concept — "A real company, shown plainly"
The photograph leads; words follow underneath it. Everything on the home page is verifiable from the client's own
material: ISO 13485:2016 (AGQR), Udyam MSME, GeM, brands stocked, address, phones, and the quality policy signed by
Dr. K. Balu. No invented numbers, testimonials, years or clients.

## Visual system
- **Logo:** the company's mark (microscope + flask + "lab") cut from the catalogue, with the wordmark set in their two
  print colours: green `#0B5A33` "Chitra Scientific" and maroon `#7A0E1B` "INDUSTRIES".
- **Photography:** hero = catalogue photo, retouched (catalogue artwork removed) and graded to a dark-green duotone so the
  teal print wash becomes deliberate. Category images = the 12 product photos from the catalogue's last page.
- **Type:** Newsreader (serif, light weight) for headings at moderate sizes; Geist for everything else; tabular numbers for prices.
- **Colour:** near-white page `#FAFAF8`, ink `#141614`, hairlines `#EBEBE8`, brand green for links/positive states,
  near-black pill for the primary action, maroon only in the wordmark and counters.
- **Structure:** hairline-ruled grids (facts, catalogue, industries) instead of floating cards; one quiet radius scale;
  no gradients, glows, blobs, tilted mock-ups, pulse dots or eyebrow labels.
- **Motion:** none on load; small hover feedback only.

## Home page order
Photo cover → credentials row → "What we supply" (10 photo categories) → quality policy note → open price list of
popular items → how ordering works + institution account → lab projects → who we supply → brands → visit/call (map).

## Client to supply before launch
Higher-resolution versions of the logo and photos (catalogue images are low resolution), confirmation that they hold
the rights to the cover photograph (it appears to be a licensed stock image), product photos, current certificates, GSTIN.
