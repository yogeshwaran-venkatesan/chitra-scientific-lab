import { Routes } from '@angular/router';
import { customerGuard } from './state/guards';

const info = () => import('./pages/info');
const shop = () => import('./pages/shop');
const acc = () => import('./pages/account');
const adm = () => import('./pages/admin');
const T = (t: string) => `${t} — Chitra Scientific`;

export const routes: Routes = [
  { path: '', title: 'Chitra Scientific Industries — Lab equipment, glassware & chemicals, Chennai', loadComponent: () => import('./pages/home').then((m) => m.Home) },
  { path: 'products', title: T('Products'), loadComponent: () => import('./pages/products').then((m) => m.Products) },
  { path: 'products/:slug', title: T('Products'), loadComponent: () => import('./pages/category').then((m) => m.Category) },
  { path: 'product/:slug', title: T('Product'), loadComponent: () => import('./pages/product').then((m) => m.ProductPage) },
  { path: 'search', title: T('Search'), loadComponent: () => import('./pages/search').then((m) => m.Search) },
  { path: 'quote', title: T('Quote basket'), loadComponent: () => import('./pages/quote').then((m) => m.Quote) },
  { path: 'cart', title: T('Cart'), loadComponent: () => shop().then((m) => m.Cart) },
  { path: 'checkout', title: T('Checkout'), canActivate: [customerGuard], loadComponent: () => shop().then((m) => m.Checkout) },
  { path: 'pay/:id', title: T('Payment'), canActivate: [customerGuard], loadComponent: () => shop().then((m) => m.Pay) },
  { path: 'login', title: T('Sign in'), loadComponent: () => shop().then((m) => m.Login) },
  { path: 'register', title: T('Register your institution'), loadComponent: () => shop().then((m) => m.Register) },
  { path: 'account/orders/:id', title: T('Order'), canActivate: [customerGuard], loadComponent: () => acc().then((m) => m.OrderDetail) },
  { path: 'account/quotations/:id', title: T('Quotation'), canActivate: [customerGuard], loadComponent: () => acc().then((m) => m.QuotationDetail) },
  { path: 'account/:tab', title: T('My account'), canActivate: [customerGuard], loadComponent: () => acc().then((m) => m.Account) },
  { path: 'account', title: T('My account'), canActivate: [customerGuard], loadComponent: () => acc().then((m) => m.Account) },
  { path: 'invoice/:id', title: T('Invoice'), loadComponent: () => acc().then((m) => m.Invoice) },
  {
    path: 'admin', title: T('Admin'), loadComponent: () => adm().then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', title: T('Admin · Dashboard'), loadComponent: () => adm().then((m) => m.AdminDash) },
      { path: 'orders', title: T('Admin · Orders'), loadComponent: () => adm().then((m) => m.AdminOrders) },
      { path: 'quotations', title: T('Admin · Quotations'), loadComponent: () => adm().then((m) => m.AdminQuotes) },
      { path: 'products', title: T('Admin · Products'), loadComponent: () => adm().then((m) => m.AdminProducts) },
      { path: 'institutions', title: T('Admin · Institutions'), loadComponent: () => adm().then((m) => m.AdminInstitutions) },
      { path: 'customers', title: T('Admin · Customers'), loadComponent: () => adm().then((m) => m.AdminCustomers) },
      { path: 'coupons', title: T('Admin · Coupons'), loadComponent: () => adm().then((m) => m.AdminCoupons) },
      { path: 'reports', title: T('Admin · Reports'), loadComponent: () => adm().then((m) => m.AdminReports) },
      { path: 'content', title: T('Admin · Content'), loadComponent: () => adm().then((m) => m.AdminContent) },
      { path: 'staff', title: T('Admin · Staff'), loadComponent: () => adm().then((m) => m.AdminStaff) },
      { path: 'audit', title: T('Admin · Audit log'), loadComponent: () => adm().then((m) => m.AdminAudit) },
    ],
  },
  { path: 'industries', title: T('Industries we serve'), loadComponent: () => info().then((m) => m.Industries) },
  { path: 'about', title: T('About us'), loadComponent: () => info().then((m) => m.About) },
  { path: 'certifications', title: T('Certifications'), loadComponent: () => info().then((m) => m.Certifications) },
  { path: 'brands', title: T('Brands we stock'), loadComponent: () => info().then((m) => m.Brands) },
  { path: 'lab-furnishing', title: T('Lab projects'), loadComponent: () => info().then((m) => m.LabFurnishing) },
  { path: 'contact', title: T('Contact'), loadComponent: () => info().then((m) => m.Contact) },
  { path: '**', title: T('Page not found'), loadComponent: () => info().then((m) => m.NotFound) },
];
