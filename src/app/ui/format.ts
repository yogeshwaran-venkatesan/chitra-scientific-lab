export const inr = (n: number) => '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
export const dt = (s?: string) => (s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const dtt = (s?: string) => (s ? new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');

export const STATUS_LABEL: Record<string, string> = {
  PAYMENT_PENDING: 'Waiting for payment', PLACED: 'Order placed', CONFIRMED: 'Confirmed', PACKED: 'Packed', SHIPPED: 'Shipped',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled', NOTE: 'Update',
  REQUESTED: 'Requested', QUOTED: 'Quotation ready', APPROVED: 'Approved — ordered', REJECTED: 'Declined', EXPIRED: 'Expired',
  PENDING: 'Waiting for approval',
};

export const PHONE = /^[6-9]\d{9}$/;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PIN = /^[1-9]\d{5}$/;
export const cleanPhone = (s: string) => s.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');

/** words for invoices — Indian numbering */
export function rupeesInWords(n: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (x: number) => (x < 20 ? a[x] : `${b[Math.floor(x / 10)]}${x % 10 ? ' ' + a[x % 10] : ''}`);
  const three = (x: number) => (x >= 100 ? `${a[Math.floor(x / 100)]} Hundred${x % 100 ? ' ' + two(x % 100) : ''}` : two(x));
  let x = Math.round(n);
  if (x === 0) return 'Rupees Zero only';
  const parts: string[] = [];
  const cr = Math.floor(x / 1e7); x %= 1e7;
  const lk = Math.floor(x / 1e5); x %= 1e5;
  const th = Math.floor(x / 1e3); x %= 1e3;
  if (cr) parts.push(`${two(cr)} Crore`);
  if (lk) parts.push(`${two(lk)} Lakh`);
  if (th) parts.push(`${two(th)} Thousand`);
  if (x) parts.push(three(x));
  return `Rupees ${parts.join(' ')} only`;
}
