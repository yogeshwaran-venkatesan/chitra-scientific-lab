// Prototype data model shared by the storefront, the B2B portal and the admin panel.
// Everything lives in the browser (localStorage) so a demo can show the full loop:
// customer orders → admin sees it → admin ships → customer sees tracking.

export type Role = 'OWNER' | 'SALES' | 'STORE' | 'ACCOUNTS';
export type OrderStatus = 'PAYMENT_PENDING' | 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PayMethod = 'ONLINE' | 'BANK' | 'CREDIT';
export type QuoteStatus = 'REQUESTED' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface Address { name: string; line1: string; line2: string; city: string; state: string; pin: string; phone: string }

export interface Institution {
  id: string; name: string; dept: string; gstin: string; city: string; state: string; type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  /** contract discount % on list price */
  contractPct: number;
  creditDays: number;
  users: Array<{ name: string; role: string; email: string }>;
  createdAt: string;
}

export interface Customer {
  id: string; name: string; phone: string; email: string;
  kind: 'RETAIL' | 'INSTITUTION';
  institutionId?: string;
  addresses: Address[];
}

export interface OrderLine { slug: string; name: string; sku: string; qty: number; unit: number; gstPct: number; hsn: string }

export interface Order {
  id: string; number: string; customerId: string; customerName: string; institutionId?: string; institutionName?: string;
  lines: OrderLine[];
  subtotal: number; discount: number; coupon?: string; shipping: number; cgst: number; sgst: number; igst: number; total: number;
  address: Address; buyerGstin?: string;
  pay: PayMethod; paid: boolean; paymentRef?: string; poFile?: string; poNumber?: string; dueDate?: string;
  status: OrderStatus; tracking?: string; courier?: string;
  history: Array<{ status: OrderStatus | 'NOTE'; at: string; by: string; note?: string }>;
  createdAt: string; invoiceNo?: string; fromQuote?: string;
  returnRequest?: string;
}

export interface QuoteLine { slug: string; name: string; sku: string; qty: number; list: number; offer: number; gstPct: number }

export interface Quotation {
  id: string; number: string; customerId?: string; customerName: string; org: string; email: string; phone: string;
  institutionId?: string; lines: QuoteLine[]; note?: string; status: QuoteStatus;
  validTill?: string; freight: number; terms?: string; createdAt: string; quotedAt?: string; orderId?: string;
}

export interface Coupon { code: string; pct: number; max: number; minOrder: number; active: boolean; uses: number }

export interface AuditEntry { at: string; who: string; role: Role | 'CUSTOMER' | 'SYSTEM'; what: string }

export interface Staff { id: string; name: string; role: Role; email: string; active: boolean }

export interface ProductOverride { price?: number; stock?: 'in' | 'low' | 'order'; enquiryOnly?: boolean; hidden?: boolean }

export interface Content { banner: string; bannerOn: boolean; announcement: string }

export interface DB {
  v: number;
  customers: Customer[];
  institutions: Institution[];
  orders: Order[];
  quotes: Quotation[];
  coupons: Coupon[];
  audit: AuditEntry[];
  staff: Staff[];
  overrides: Record<string, ProductOverride>;
  content: Content;
  seq: { order: number; invoice: number; quote: number };
}

export const STATES = [
  'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Puducherry', 'Maharashtra', 'Delhi', 'Gujarat', 'West Bengal',
  'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Odisha', 'Punjab', 'Haryana', 'Bihar', 'Assam', 'Goa', 'Other',
];

/** Seller is in Tamil Nadu (state code 33): same state → CGST + SGST, else IGST. */
export const SELLER_STATE = 'Tamil Nadu';
export const SELLER_GSTIN = '33XXXXX0000X1ZX';
export const FREE_SHIPPING_FROM = 5000;
export const SHIPPING_FEE = 150;

export const ROLE_LABEL: Record<Role, string> = { OWNER: 'Owner', SALES: 'Sales', STORE: 'Store & dispatch', ACCOUNTS: 'Accounts' };

/** What each staff role may open in admin (the real system enforces this on the server). */
export const PERMISSIONS: Record<string, Role[]> = {
  dashboard: ['OWNER', 'SALES', 'STORE', 'ACCOUNTS'],
  orders: ['OWNER', 'SALES', 'STORE', 'ACCOUNTS'],
  'orders.status': ['OWNER', 'STORE'],
  'orders.payment': ['OWNER', 'ACCOUNTS'],
  quotations: ['OWNER', 'SALES'],
  products: ['OWNER', 'SALES', 'STORE'],
  'products.price': ['OWNER', 'SALES'],
  'products.stock': ['OWNER', 'STORE'],
  institutions: ['OWNER', 'SALES'],
  customers: ['OWNER', 'SALES', 'ACCOUNTS'],
  coupons: ['OWNER', 'SALES'],
  reports: ['OWNER', 'ACCOUNTS'],
  content: ['OWNER'],
  staff: ['OWNER'],
  audit: ['OWNER'],
};

const iso = (daysAgo: number, h = 11) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, 15, 0, 0);
  return d.toISOString();
};

const ADDR_COLLEGE: Address = { name: 'Dr. R. Meena, HOD Chemistry', line1: 'Department of Chemistry, Block B', line2: 'Sri Lakshmi Arts & Science College, Poonamallee High Road', city: 'Chennai', state: 'Tamil Nadu', pin: '600077', phone: '9840012345' };
const ADDR_PRIYA: Address = { name: 'Priya Raman', line1: '12, 3rd Cross Street', line2: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', pin: '560038', phone: '9876543210' };

/** Sample data — invented names for the demo, not real customers. */
export function seed(): DB {
  const db: DB = {
    v: 3,
    customers: [
      { id: 'c-college', name: 'Dr. R. Meena', phone: '9840012345', email: 'chemistry@slasc.example.in', kind: 'INSTITUTION', institutionId: 'i-slasc', addresses: [ADDR_COLLEGE] },
      { id: 'c-priya', name: 'Priya Raman', phone: '9876543210', email: 'priya@example.com', kind: 'RETAIL', addresses: [ADDR_PRIYA] },
      { id: 'c-hosp', name: 'K. Arun', phone: '9445098765', email: 'purchase@vhospital.example.in', kind: 'INSTITUTION', institutionId: 'i-vh', addresses: [] },
    ],
    institutions: [
      { id: 'i-slasc', name: 'Sri Lakshmi Arts & Science College', dept: 'Department of Chemistry', gstin: '33AAATS1234F1Z9', city: 'Chennai', state: 'Tamil Nadu', type: 'College / university', status: 'APPROVED', contractPct: 12, creditDays: 30,
        users: [{ name: 'Dr. R. Meena', role: 'HOD', email: 'chemistry@slasc.example.in' }, { name: 'S. Karthik', role: 'Lab assistant', email: 'lab.chem@slasc.example.in' }, { name: 'M. Devi', role: 'Purchase officer', email: 'purchase@slasc.example.in' }], createdAt: iso(140) },
      { id: 'i-vh', name: 'Vasan Multispeciality Hospital', dept: 'Pathology Laboratory', gstin: '33AABCV5678K1Z2', city: 'Vellore', state: 'Tamil Nadu', type: 'Hospital / medical college', status: 'PENDING', contractPct: 0, creditDays: 0,
        users: [{ name: 'K. Arun', role: 'Purchase manager', email: 'purchase@vhospital.example.in' }], createdAt: iso(1) },
      { id: 'i-kpr', name: 'KPR Polytechnic College', dept: 'Civil Engineering Lab', gstin: '33AAAKP4321C1Z7', city: 'Coimbatore', state: 'Tamil Nadu', type: 'College / university', status: 'APPROVED', contractPct: 8, creditDays: 15,
        users: [{ name: 'P. Suresh', role: 'Lab in-charge', email: 'civil@kpr.example.in' }], createdAt: iso(300) },
    ],
    orders: [],
    quotes: [],
    coupons: [
      { code: 'LAB10', pct: 10, max: 2000, minOrder: 5000, active: true, uses: 14 },
      { code: 'NEWLAB5', pct: 5, max: 1000, minOrder: 2000, active: true, uses: 3 },
      { code: 'EXAM2025', pct: 15, max: 3000, minOrder: 10000, active: false, uses: 41 },
    ],
    audit: [],
    staff: [
      { id: 's1', name: 'Dr. K. Balu', role: 'OWNER', email: 'owner@chitrascientific.in', active: true },
      { id: 's2', name: 'Ramesh', role: 'SALES', email: 'sales@chitrascientific.in', active: true },
      { id: 's3', name: 'Murugan', role: 'STORE', email: 'store@chitrascientific.in', active: true },
      { id: 's4', name: 'Lakshmi', role: 'ACCOUNTS', email: 'accounts@chitrascientific.in', active: true },
    ],
    overrides: {},
    content: { banner: 'Practical exam season: order glassware before 15 February for on-time delivery.', bannerOn: true, announcement: '' },
    seq: { order: 1040, invoice: 386, quote: 212 },
  };
  return db;
}

export { iso };
