// Company facts from the Chitra Scientific Industries profile. Certificates are shown as the company
// must supply them CURRENT — the prototype marks them "to be updated" rather than showing expired dates as valid.

export const COMPANY = {
  name: 'Chitra Scientific Industries',
  short: 'Chitra Scientific',
  line: 'Manufacturers of laboratory instruments, stockists of glassware and suppliers of chemicals',
  address: ['#27, 1st Main Road', 'Venkatasubramania Samy Nagar', 'Valasaravakkam, Chennai 600 087'],
  phones: ['044 4868 3734', '97515 13734', '99628 53734', '94444 73706'],
  whatsapp: '919751513734',
  emails: ['chitrascientific@gmail.com', 'chitrascitific@yahoo.com', 'yogatharanalab@gmail.com'],
  web: 'www.chitrascientific.in',
  leader: { name: 'Dr. K. Balu', title: 'Chief Secretary' },
  quality:
    'We are committed to customer satisfaction by providing quality products on time. We achieve this through employee involvement and teamwork, effective use of resources, and continual improvement of our quality management system.',
};

export const INDUSTRIES = [
  { name: 'Medical colleges & hospitals', note: 'Anatomy, pathology, microbiology, pharmacology and clinical labs', icon: 'microscope' },
  { name: 'Arts, science & engineering colleges', note: 'Botany, zoology, physics, chemistry, biotechnology, civil and mechanical labs', icon: 'flask' },
  { name: 'Universities & research centres', note: 'R&D laboratories, tea research centres, research health labs', icon: 'dna' },
  { name: 'Pharmaceutical & drug industry', note: 'QC labs, tablet testing, dissolution and stability', icon: 'tablet' },
  { name: 'Petroleum, oil & chemical industry', note: 'Flash point, viscosity, grease and wax testing', icon: 'oil' },
  { name: 'Civil, PWD & railways', note: 'Soil, cement, bitumen and road testing', icon: 'road' },
  { name: 'Food, dairy & aquaculture', note: 'Dairy plant equipment, food QC, poultry feeds', icon: 'petri' },
  { name: 'Paint, leather, garment & cosmetics', note: 'Coating, colour and quality testing', icon: 'paint' },
  { name: 'Steel, foundry & power stations', note: 'Carbon & sulphur, furnaces, fume cupboards', icon: 'furnace' },
  { name: 'Agriculture & animal science', note: 'Seed germinators, egg incubators, growth chambers', icon: 'seed' },
  { name: 'Jewellery & cement industries', note: 'Assaying, balances and material testing', icon: 'balance' },
  { name: 'Schools & pre-schools', note: 'Science kits, charts, models and early-learning kits', icon: 'slide' },
] as const;

export const CERTIFICATES = [
  { name: 'ISO 13485:2016', scope: 'Medical devices quality management — manufacturing and supply of medical laboratory equipment and glassware to hospitals and research laboratories', by: 'AGQR Certifications (SACB accredited)', status: 'Current certificate to be supplied' },
  { name: 'ISO 9001:2015', scope: 'Quality management system', by: 'Certifying body to be confirmed', status: 'Current certificate to be supplied' },
  { name: 'UN packaging certificate', scope: 'Composite IBC packaging for transport of chemicals, tested by the Indian Institute of Packaging', by: 'Indian Institute of Packaging', status: 'Renewal to be supplied' },
  { name: 'Udyam (MSME) registration', scope: 'Registered micro, small & medium enterprise; ZED pledge taken', by: 'Ministry of MSME, Government of India', status: 'UDYAM-TN-24-0021464' },
  { name: 'GeM registered seller', scope: 'Supplies to government buyers through the Government e-Marketplace', by: 'GeM', status: 'Seller ID to be added' },
];

export const STOCKED_BRANDS = {
  Chemicals: ['Merck', 'Sigma-Aldrich', 'Qualigens', 'Loba Chemie', 'SRL', 'Thermo Fisher', 'Rankem', 'J.T. Baker', 'SD Fine', 'CDH', 'Spectrochem', 'Otto Chemie', 'Alpha Chemika', 'HiMedia', 'Titan Media', 'Medox Biotech'],
  'Glassware & plasticware': ['Borosil', 'Schott Duran', 'Revira', 'Tarsons', 'Polylab', 'Thiasil'],
  'Filter papers': ['Whatman', 'Sartorius', 'Pall'],
  Instruments: ['Remi', 'Elico', 'Systronics', 'Labomed', 'Olympus', 'Unilab ISI', 'INCO', 'Orchid', 'Toshniwal', 'Yorco', 'Hanna', 'Lovibond', 'Mitutoyo', 'Eppendorf', 'Bio Systems'],
  Balances: ['Mettler Toledo', 'Sartorius', 'Shimadzu', 'Keroy', 'Citizen', 'Equiptron'],
  Physics: ['Pico Physics', 'Esal'],
};

export const UNITS = [
  'Lab equipment', 'Lab glassware', 'Lab instruments', 'Plasticware', 'Fibre models & charts', 'R&D equipment', 'Lab furniture',
  'Dental equipment', 'Medical college & hospital equipment', 'Microbiology & biotech equipment', 'Pharmacy & pharmacology equipment',
  'Anatomy & forensic equipment', 'Anthropology equipment', 'Dairy plant equipment', 'Hospital & clinical furniture', 'Surgical instruments',
];
