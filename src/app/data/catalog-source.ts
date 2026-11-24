// Product names transcribed from the Chitra Scientific Industries profile (2023), spelling corrected,
// duplicates removed and regrouped into clear categories. Prices, brands and specifications in the
// prototype are SAMPLE values generated in catalog.ts — the real ones come from the company.

export type IconName =
  | 'flask' | 'microscope' | 'centrifuge' | 'crucible' | 'filter' | 'gel' | 'petri' | 'magnet' | 'pendulum'
  | 'kymograph' | 'beaker' | 'oven' | 'seed' | 'furnace' | 'cloud' | 'grease' | 'cooling' | 'oil' | 'road'
  | 'meter' | 'paint' | 'tablet' | 'weather' | 'soil' | 'dna' | 'slide' | 'balance' | 'bottle' | 'furniture' | 'tooth';

export interface CategorySource {
  slug: string;
  name: string;
  group: string;
  icon: IconName;
  blurb: string;
  /** price band in rupees for sample prices */
  band: [number, number];
  brands: string[];
  items: string;
}

export const GROUPS = [
  'Glassware & labware',
  'Life sciences',
  'Physics & engineering',
  'Instruments & meters',
  'Industrial testing',
  'Chemicals',
  'Teaching aids & furniture',
] as const;

export const CATEGORY_SOURCE: CategorySource[] = [
  {
    slug: 'chemistry-apparatus', name: 'Chemistry apparatus', group: 'Glassware & labware', icon: 'flask', band: [60, 4500],
    brands: ['Borosil', 'Schott Duran', 'Revira', 'Tarsons', 'Polylab'],
    blurb: 'Beakers, flasks, burettes, funnels and everything a chemistry bench uses every day.',
    items: 'Acid bowls|Alcohol thermometers|Amber glassware|Aspirator bottles|Basins, porcelain|Beakers|Beehive shelf|Beaker tongs|Blow pipe|Buchner funnels|Burette stands|Burette brushes|Burettes|Bunsen burners|Centrifuge tubes|China dishes|Clamp with bossheads|Clay pipe triangles|Combustion boats|Conical flasks|Cork borers|Crucible with lids|Crucible tongs|Desiccators|Dropping bottles|Durham tubes|Dropper with teats|Evaporating dishes|Fermentation vessels|Filter paper ream|Fisher clamps for burettes|Filter pumps, brass|Flask tongs|Forceps|Funnels|Fractional weight boxes|Funnel stands|Gas taps|Glass beads|Glass rods|Glass tubes|Glass troughs|Gas jars|Gooch crucibles|Hoffmann screw clips|Hand centrifuge machines|Ignition tubes|Jolly\'s air bulbs|Kipp\'s apparatus|Label books|Litmus paper (red or blue)|Meker burners|Melting point capillary tubes|Measuring cylinders|Mortar & pestles|Nickel spatulas|Petri dishes|Pinch clips|Pipettes|Platinum loop holders|Pipette stands|Pipette brushes|Pipette bulbs|Porcelain tiles|Precision thermometers|Pressure rubber tubing|Pycnometers|Rectangular jars|Reagent bottles|Retort rings|Retort stands|Rubber corks|Rubber hand gloves|Specific gravity bottles|Sand baths|Sodium fusion tubes|Semi-micro burners|Spirit lamps|Separating funnels|Test tube holders|Test tubes|Test tube stands|Test tube brushes|Thistle funnels|Tripod stands|Universal condenser clamps|Viscometer, glass|Wash bottles|Winchester bottles|Weighing bottles|Water bath, copper|Watch glasses|Wall thermometers|Wet & dry bulb thermometers|Wire gauze',
  },
  {
    slug: 'silica-nickel-platinum-teflon', name: 'Silica, nickel, platinum & PTFE ware', group: 'Glassware & labware', icon: 'crucible', band: [450, 38000],
    brands: ['Thiasil', 'Tarsons', 'Polylab'],
    blurb: 'High-temperature and corrosion-resistant crucibles, basins and labware.',
    items: 'Silica crucibles|Silica basins|Silica capsules|Coking crucibles (VM)|Nickel crucibles|Platinum crucibles|Platinum basins|Platinum-tipped tongs|PTFE beakers|PTFE bottles|Spatula crucibles|PTFE cones|PTFE paddles',
  },
  {
    slug: 'filter-papers', name: 'Filter papers & membranes', group: 'Glassware & labware', icon: 'filter', band: [180, 9500],
    brands: ['Whatman', 'Sartorius', 'Pall'],
    blurb: 'Qualitative and quantitative papers, membranes, syringe filters and thimbles.',
    items: 'Indian filter papers|Filter paper sheets|Filter paper circles|Whatman filter papers|Membrane filters|Microfibre filters|Extraction thimbles|Chromatography papers|Syringe filters|Microplates|Bug stoppers|Auto cups|Pall Gelman filter paper',
  },
  {
    slug: 'plastic-ware', name: 'Plastic labware', group: 'Glassware & labware', icon: 'bottle', band: [40, 2400],
    brands: ['Tarsons', 'Polylab'],
    blurb: 'Unbreakable bottles, beakers, cylinders, tips and storage for everyday lab use.',
    items: 'Polypropylene beakers|Measuring cylinders, PP|Wash bottles, LDPE|Reagent bottles, HDPE|Micro centrifuge tubes|Micropipette tips|Tip boxes|Cryo vials|Funnels, PP|Carboys with stopcock|Desiccator, polycarbonate|Test tube racks|Petri dishes, disposable|Storage boxes|Pipette stands, PP',
  },
  {
    slug: 'biology-apparatus', name: 'Biology apparatus', group: 'Life sciences', icon: 'slide', band: [90, 28000],
    brands: ['Labomed', 'Olympus', 'Blue Star'],
    blurb: 'Dissection, slides, specimens and teaching equipment for biology labs.',
    items: 'Bell jars|Cavity slides|Cavity blocks|Camera lucida|Cover slips|Dissecting microscopes|Dissection needles|Dissection trays|Dissection boards|Dissection hammers|Double demonstration eyepiece|Drawing boards|Enamel trays|Eyepieces|Film strip projector|Ganong\'s potometer|Klinostat|Mariner\'s compass|Max & min thermometer|Mechanical stage|Micro slides|Oil immersion|Pointer eyepiece|Scalpels, stainless steel|Slide boxes|Slides|Specimen jars|Specimens',
  },
  {
    slug: 'microscopes', name: 'Microscopes', group: 'Life sciences', icon: 'microscope', band: [3800, 285000],
    brands: ['Olympus', 'Labomed', 'Unilab ISI'],
    blurb: 'Student, medical, research and metallurgical microscopes for every level.',
    items: 'Dissecting microscope|Student microscope|Inclined microscope|Medical microscope|Research binocular microscope|Research inclined microscope|Monocular microscope|Trinocular microscope|Phase contrast microscope|Metallurgical microscope|Projection microscope|Compound microscope|Travelling microscope',
  },
  {
    slug: 'centrifuges', name: 'Centrifuges', group: 'Life sciences', icon: 'centrifuge', band: [6500, 420000],
    brands: ['Remi', 'Eppendorf', 'Labomed'],
    blurb: 'Clinical, micro, cooling and high-speed centrifuges for labs and blood banks.',
    items: 'Medico centrifuge|Clinical centrifuge|Doctor centrifuge|Laboratory centrifuge|General purpose centrifuge|High speed centrifuge|Micro centrifuge|Special purpose centrifuge|Chemical basket centrifuge|Research centrifuge|Table-top cooling centrifuge|Speed cooling centrifuge|Oil testing centrifuge|Blood bank refrigerated centrifuge|Heavy duty refrigerated centrifuge|Non-refrigerated centrifuge',
  },
  {
    slug: 'electrophoresis', name: 'Electrophoresis systems', group: 'Life sciences', icon: 'gel', band: [5500, 185000],
    brands: ['Genei', 'Bio-Rad', 'Techno Source'],
    blurb: 'Gel systems, transfer units, transilluminators and power supplies.',
    items: 'Paper electrophoresis system|Horizontal electrophoresis|Submarine gel system|Rod (tube/disc) gel system|Vertical slab gel system|Sequencing system|Multi-purpose electrophoresis|Electro transfer system|Transilluminator|Power supply',
  },
  {
    slug: 'microbiology-pathology', name: 'Microbiology & pathology', group: 'Life sciences', icon: 'petri', band: [450, 360000],
    brands: ['Remi', 'HiMedia', 'Labomed', 'Erba'],
    blurb: 'Incubators, analysers, tissue processing and diagnostic equipment.',
    items: 'Magnetic stirrer|Micro balance|Automatic tissue processor|Knife sharpener|Tissue capsules|Lovibond comparator|Tissue flotation bath|Serum centrifuge|Slide cabinet|CO2 incubator|Cell culture incubator|Autoclave sterilizer|Agar plates|Auto analyser|Semi-auto analyser|Blood cell counter|ELISA reader & washer|Nebuliser|Aerosol disinfector|Colony counter|Digital pH meter|Digital conductivity meter|Bacteriological incubator|BOD incubator|Inoculation hood|Serological water bath|Slide warming table|Tissue homogeniser|Paraffin bath|Blood lancets|Anaerobic jar|Sterilization indicators|Serum inspissator|Quartz distiller|Biosafety cabinet|Haemometer|ESR Westergren tubes|Haemocytometer|Khan test tube stand|Laminar flow bench|Microtome',
  },
  {
    slug: 'biotechnology', name: 'Biotechnology', group: 'Life sciences', icon: 'dna', band: [2500, 650000],
    brands: ['Eppendorf', 'Thermo Fisher', 'Bio-Rad'],
    blurb: 'PCR, gel documentation, fermenters and precision pipetting.',
    items: 'PCR thermocycler|Gel documentation system|Cooling centrifuge|Fermenter|Micropipettes|Walk-in incubator|ELISA reader / washer|Laminar flow bench|Analytical balance|Top pan balance',
  },
  {
    slug: 'pharmacology', name: 'Pharmacology equipment', group: 'Life sciences', icon: 'kymograph', band: [1800, 145000],
    brands: ['INCO', 'Orchid', 'Techno'],
    blurb: 'Organ baths, kymographs and recording equipment for pharmacology departments.',
    items: 'Assembly for perfusion of mammalian heart|Gaddum\'s outflow recorder|Thermostatic organ bath|Cannula (venous & arterial)|Long extension kymograph|Student kymograph|Enterograph|Stimulator|Rotarod assembly|Smoking & varnishing outfit|Nerve muscle assembly|Stethograph|Animal cage|Animal operating table|Mercury manometer|Cook\'s pole climbing apparatus|Electro convulsiometer|Metronome|Antihistamine chamber|Polygraph, all channel|Myograph lever|Bicycle ergograph|Eddy\'s hot plate|Actophotometer|Animal holders|Tambours|Respiration pump|Animal balance',
  },
  {
    slug: 'pharmaceutical', name: 'Pharmaceutical equipment', group: 'Life sciences', icon: 'tablet', band: [3500, 260000],
    brands: ['Electrolab', 'Labindia', 'Veego'],
    blurb: 'Tablet testing, dissolution, coating and ampoule equipment.',
    items: 'Tablet hardness tester|Tablet disintegration test apparatus|Tablet friability test apparatus|Dissolution rate test apparatus|Capsule counter|Tablet counter|Coating pan|Polishing pan|Tablet punch, hand operated|Ampoule washing machine|Ampoule sealing & filling machine|Tincture press|Clarity test apparatus|Suppository moulds|Percolators',
  },
  {
    slug: 'physics-apparatus', name: 'Physics apparatus', group: 'Physics & engineering', icon: 'magnet', band: [45, 32000],
    brands: ['Pico Physics', 'Esal', 'Systronics'],
    blurb: 'Optics, electricity, magnetism and mechanics apparatus for school and college labs.',
    items: 'Accumulators|Alnico magnets|Ammeters|Astronomical telescope|Magnifiers|Atomic model sets|Aneroid barometer|Ball & ring apparatus|Battery eliminators|Battery chargers|Bar magnets|Bar pendulum|Fortin barometer|Boyle\'s law apparatus|Calorimeter, copper|Coefficient of linear expansion apparatus|Commutators|Concave lens|Convex lens|Concave mirror|Convex mirror|Copper voltameter|Crocodile clips|DPDT switches|Daniell cells|Deflagrating spoons|Diffraction gratings|Dip circle|Diode characteristics apparatus|Ebonite rods|Electric bell demonstration|Electric motor model|Electromagnet, U-shaped|Galvanometers|Glass prisms|Hare\'s apparatus|High resistance box|Hollow glass prism|Horseshoe magnet|Hydrostatic balance|Vernier calipers|Inclined plane|Joule\'s calorimeter|Kaleidoscope|Knife edges|Kundt\'s tube apparatus|Logic gate trainer|Leclanché cells|Linear expansion apparatus|Magnetometers|Magnetic compass|Magnetic needles|Meter bridge|Meter scales|Micrometers|Millivoltmeters|Melde\'s apparatus|Newton\'s rings apparatus|Newton\'s colour disc|Nichrome wire|Ohm\'s law apparatus|Optical bench|Parallelogram of forces apparatus|Pascal\'s law apparatus|Pendulum bobs|Periscope|Physical balance|Plug keys|Potentiometers|Post office box|Prisms|Pulleys|Reading telescope|Resistance boxes|Resistance coils|Rheostats|Screw gauge|Single optic levers|Sonometer|Sodium vapour lamp|Semiconductor diodes|Spectrometer|Spirit level|Spring balance|Stop clock|Tangent galvanometer|Tapping keys|Terrestrial telescope|Torsion pendulum|Transistor characteristics apparatus|Tuning forks|Voltmeters|Wave motion apparatus|Young\'s modulus apparatus|Zinc plates|Zinc rods',
  },
  {
    slug: 'balances', name: 'Balances & weights', group: 'Instruments & meters', icon: 'balance', band: [650, 340000],
    brands: ['Mettler Toledo', 'Sartorius', 'Shimadzu', 'Citizen'],
    blurb: 'From student physical balances to analytical and micro balances with certified weights.',
    items: 'Single pan balance|Table-top digital balance|Semi-micro balance|Micro balance|Precision balance|Moisture balance|Platform balance|Adult weighing machine|Analytical weighing balance|Physical balance|Chemical balance|Dispensing balance|Spring balance|Double pan balance|Triple beam balance|Animal weighing machine|Baby weighing machine|Organ weighing machine|Top loading balance|Standard weights, class F1|Standard weights, class F2|Standard weights, class E1|Standard weights, class E2|Fractional weight box|Analytical weight box',
  },
  {
    slug: 'meters-analysers', name: 'Meters & analysers', group: 'Instruments & meters', icon: 'meter', band: [2800, 1250000],
    brands: ['Elico', 'Systronics', 'Hanna', 'Shimadzu'],
    blurb: 'Spectrophotometers, pH and conductivity meters, HPLC and water quality analysers.',
    items: 'Atomic absorption spectrophotometer|UV-VIS spectrophotometer|Flame photometer|Ion analyser|pH meter|HPLC system|Potentiostat / galvanostat|IR gas analyser|Nephelometer|Fluorimeter|GC system|Karl Fischer titrator|Potentiometric titrator|Chloride meter|Water quality analyser|Conductivity meter|Dissolved oxygen analyser|Fluoride meter|Colorimeter|Densitometer|Soil moisture meter|Polarimeter|Refractometer|Saccharimeter|Bomb calorimeter|Digital melting point apparatus|Leaf area meter',
  },
  {
    slug: 'general-lab-equipment', name: 'General lab equipment', group: 'Instruments & meters', icon: 'oven', band: [3200, 220000],
    brands: ['Remi', 'Navyug', 'Labline'],
    blurb: 'Ovens, incubators, water baths, fume hoods and distillation units.',
    items: 'Autoclave|Heating mantle|Heating tape|Burette & pipette washer|Chromatography chamber|Drying oven|Gas furnace|Glassware dryer|Electric Bunsen burner|Fume hood|Hot air oven|Desiccating cabinet|Hot plate|Incubator|Kjeldahl digestion apparatus|Kjeldahl distillation apparatus|Melting point apparatus, digital|Soxhlet extraction apparatus|Tray dryer|Vacuum oven|Vacuum pump|Water bath|Magnetic stirrer|Laboratory stirrer|Water still',
  },
  {
    slug: 'cooling-equipment', name: 'Cooling equipment', group: 'Instruments & meters', icon: 'cooling', band: [24000, 950000],
    brands: ['Blue Star', 'Remi', 'Labline'],
    blurb: 'Blood bank chambers, deep freezers, BOD incubators and walk-in cabinets.',
    items: 'Blood bank chamber|BOD incubator|Carbon dioxide incubator|Chromatography refrigerator|Frozen semen storage cabinet|Low temperature research cabinet|Mortuary chamber|Deep freezer|Refrigerated water bath|Seed germinator|Ultra low temperature cabinet|Walk-in humidity cabinet|Walk-in incubator|Plant growth chamber|Ice making machine',
  },
  {
    slug: 'seed-plant-animal', name: 'Seed, plant & animal science', group: 'Instruments & meters', icon: 'seed', band: [9500, 480000],
    brands: ['Labline', 'Remi'],
    blurb: 'Germinators, humidity ovens, egg incubators and growth cabinets.',
    items: 'Egg incubator|Frozen semen storage cabinet|Humidity oven|Carbon dioxide incubator|Seed germinator|UV cabinet|Walk-in humidity cabinet|Walk-in incubator|Ultra cryostat',
  },
  {
    slug: 'petroleum-testing', name: 'Petroleum oil testing', group: 'Industrial testing', icon: 'oil', band: [6500, 240000],
    brands: ['Aimil', 'Petrotest', 'Labline'],
    blurb: 'Flash point, viscosity, carbon residue and pour point apparatus.',
    items: 'Aniline point apparatus|Abel flash point apparatus|ASTM colour comparator|Bomb calorimeter|Bromine number testing apparatus|Conradson carbon residue apparatus|Cloud & pour point apparatus|Cleveland apparatus|Engler viscometer|Existent gum bath|Flow cup viscometer|Foaming test apparatus|Kinematic viscometer bath|Pensky-Martens flash point apparatus|Redwood viscometer No.1|Redwood viscometer No.2|Ramsbottom carbon residue apparatus|Saybolt viscometer',
  },
  {
    slug: 'grease-wax-testing', name: 'Grease & wax testing', group: 'Industrial testing', icon: 'grease', band: [8500, 185000],
    brands: ['Aimil', 'Petrotest'],
    blurb: 'Drop point, penetration, oxidation stability and wax testing equipment.',
    items: 'ASTM colour comparator|Carrying rust test|Drop point of grease|Deleterious particles in grease|Evaporation loss of lubricating grease|Emcor test|Grease worker|Grease cutter|Heat stability of grease|Leakage tendencies of grease|Melting point of petroleum wax|Oil separation|Oil content of petroleum wax|Oxidation stability of grease|Penetrometer|Roll stability of grease|Saponification value|Sulphated ash|Water wash-out|Apparatus for apparent viscosity|Low temperature torque apparatus',
  },
  {
    slug: 'tar-bitumen-testing', name: 'Tar & bitumen testing', group: 'Industrial testing', icon: 'road', band: [3500, 145000],
    brands: ['Aimil', 'Heico'],
    blurb: 'Ductility, softening point, penetration and extraction equipment for road labs.',
    items: 'Adhesiveness test|Bitumen extractor|Breaking strength|Breaking point of bitumen|Conradson carbon residue|Creosote oil & anthracene oil|Distillation of road tar|Distillation of cut-back bitumen|Ductility testing machine|Determination of phenol|Determination of volatile matter|Determination of mineral matter|Determination of insolubles in toluene|Determination of insolubles in benzene|Determination of naphthalene|Electrical strength|Extension test|E.V.T. viscometer|Filter settlement|Flow test|Float test|Hardness tester for bitumen mastic|Loss on heating|Softening point (ring & ball)|Storage sticking test',
  },
  {
    slug: 'paint-testing', name: 'Paint testing instruments', group: 'Industrial testing', icon: 'paint', band: [2200, 165000],
    brands: ['Sheen', 'Elcometer', 'Labline'],
    blurb: 'Film thickness, adhesion, viscosity and impact testing for coatings labs.',
    items: 'Abel flash point apparatus|Bend test mandrels|Chequer boards|Wet film thickness gauge|Flow cups (IS 101)|Film applicators|Film thickness gauge|Gardner viscometer|Hegman gauge|Paint corrosion cabinet|Paint panels|Paint stickiness tester|Pressure test|Scratch hardness tester|Weight per litre cup|Conical mandrel|Cross cut tester|Dry film thickness gauge|Bubble viscometer tubes|Wire bar coaters|Zahn cup viscometer|Stormer viscometer|Falling ball impact tester|Automatic pigment muller|Brookfield viscometer|Sieves|Wet abrasion tester|Cupping test by deep drawing|Digital dew point apparatus|Multi-light colour matching cabinet|Rub-proofness tester for prints|Bond / peel test apparatus|Pinhole detector|Vibro shaker|Falling bar viscometer|Coating thickness gauge|Banana type thickness gauge',
  },
  {
    slug: 'soil-cement-testing', name: 'Soil & cement testing', group: 'Industrial testing', icon: 'soil', band: [450, 225000],
    brands: ['Aimil', 'Heico', 'Labline'],
    blurb: 'Compaction, shear, permeability and sieve equipment for civil engineering labs.',
    items: 'Andreasen pipette|Abbot compaction apparatus|Benkelman beam apparatus|Core cutter|Compaction test apparatus|California bearing ratio apparatus|Drive weights|Direct shear apparatus|Dynamic cone penetration|Extension rods|Extractor frames|Guide pipe assembly|Grinders|Hydrometers|Jarring links|Jodhpur permeameter|Kelly ball penetration apparatus|Pad frames|Load truss|Moisture meter moulds|Miniature permeameter|North Dakota cones|Plummet balance|Penetrometers|Plastic limit sets|Pycnometers|Proctor needles|Permeability apparatus|Pore pressure apparatus|Plate bearing test apparatus|Soil pulverizer|Proving rings|Relative density apparatus|Sampling outfits|Sand pouring cylinders|Sand absorption cone & tamper|Static cone penetrometer|Soil sampling kits|Soil trimmers|Sieve shakers|Stirrer, high speed|Shrinkage limit sets|Triaxial cells|Tamping bars|Universal testing machine|Compactors|Unconfined compression apparatus|Vane shear apparatus',
  },
  {
    slug: 'pollution-control', name: 'Pollution control & environment', group: 'Industrial testing', icon: 'cloud', band: [12000, 380000],
    brands: ['Envirotech', 'Labline'],
    blurb: 'BOD and COD equipment, meters and laminar airflow for environment labs.',
    items: 'BOD incubator|COD digester|Water analysis kit|Dust sampler|Laminar airflow unit|Turbidity meter|Noise level meter',
  },
  {
    slug: 'weather-stations', name: 'Weather instruments', group: 'Industrial testing', icon: 'weather', band: [1800, 285000],
    brands: ['Imported', 'Nivo'],
    blurb: 'Rain gauges, anemometers, Stevenson screens and imported weather stations.',
    items: 'Automatic water level stage recorder|FRP rain gauge, self recording|FRP rain gauge, non-recording|Symons type rain gauge|Cup anemometer|Pan evaporimeter|Rain gauge|Stevenson screen|Snow gauge|Wind vane|Sunshine recorder|Soil thermometer|Automatic weather station (imported)',
  },
  {
    slug: 'steel-lab', name: 'Steel lab equipment', group: 'Industrial testing', icon: 'furnace', band: [9000, 260000],
    brands: ['Navyug', 'Labline'],
    blurb: 'Carbon & sulphur apparatus, furnaces and fume cupboards for metallurgy labs.',
    items: 'Carbon & sulphur apparatus|Muffle furnace|Tubular furnace|Hot plate, heavy duty|Hot air oven|Analytical balance|Fume cupboard',
  },
  {
    slug: 'chemicals', name: 'Laboratory chemicals', group: 'Chemicals', icon: 'bottle', band: [85, 14500],
    brands: ['Merck', 'Sigma-Aldrich', 'Loba Chemie', 'SRL', 'Qualigens', 'HiMedia', 'SD Fine'],
    blurb: 'AR, GR and LR grade chemicals, culture media and reagents. Bulk acids on enquiry.',
    items: 'Sodium chloride AR, 500 g|Potassium dichromate AR, 500 g|Copper sulphate pentahydrate, 500 g|Sodium hydroxide pellets, 500 g|Ethanol absolute, 500 ml|Methanol HPLC, 2.5 L|Acetone AR, 500 ml|Phenolphthalein indicator, 125 ml|Methyl orange indicator, 125 ml|Buffer tablets pH 4, 7, 9|Silver nitrate AR, 25 g|EDTA disodium salt, 500 g|Nutrient agar, 500 g|MacConkey agar, 500 g|Gram stain kit|Giemsa stain, 125 ml|Hydrochloric acid 35%, 2.5 L|Sulphuric acid 98%, 2.5 L|Nitric acid 69%, 2.5 L|Glacial acetic acid, 2.5 L|Ammonia solution 25%, 2.5 L|Hydrogen peroxide 30%, 500 ml|Formaldehyde 37%, 500 ml|Potassium permanganate, 500 g',
  },
  {
    slug: 'teaching-aids', name: 'Models, charts & slides', group: 'Teaching aids & furniture', icon: 'slide', band: [250, 38000],
    brands: ['Yogatharana', 'KitVA'],
    blurb: 'Anatomy models, permanent slides, charts and early-learning kits for schools and colleges.',
    items: 'Human torso model|Human skeleton, full size|Human heart model|Human brain model|Human eye model|Human ear model|Forensic medicine charts|Pharmacology charts|Pathology charts|Permanent slides, botany set|Permanent slides, zoology set|Biology charts set|Physics charts set|Chemistry charts set|Mathematics charts set|Engineering charts set|Encapsulated specimens|Scientist portraits|Pre-school learning kit|Writing board|Projection screen',
  },
  {
    slug: 'lab-furniture', name: 'Lab furniture', group: 'Teaching aids & furniture', icon: 'furniture', band: [6500, 420000],
    brands: ['Yogatharana'],
    blurb: 'Island and wall benches, fume cupboards and storage, designed and installed.',
    items: 'Island work bench|Wall bench with reagent shelf|Fume cupboard, ducted|Laminar flow workstation|Chemical storage cabinet|Lab stool|Sink unit with drain board|Hospital bed, semi-fowler|Instrument trolley|Examination couch',
  },
  {
    slug: 'dental-surgical', name: 'Dental & surgical', group: 'Teaching aids & furniture', icon: 'tooth', band: [450, 385000],
    brands: ['Yogatharana'],
    blurb: 'Dental chairs, instruments and surgical equipment for clinics and colleges.',
    items: 'Dental chair unit|Dental light-cure unit|Dental instrument set|Surgical instrument set|Kidney tray, stainless steel|Dressing drum|Instrument sterilizer|Suction apparatus',
  },
];

/** Raw chemicals that are sold only on enquiry (hazardous / bulk / licence rules). */
export const ENQUIRY_ONLY = /(acid|ammonia solution|hydrogen peroxide|formaldehyde|permanganate)/i;
