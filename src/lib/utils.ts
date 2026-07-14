import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMZN(value: number) {
  return new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value) + ' MT'
}

export function formatDate(value: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium', timeStyle: 'short', ...opts }).format(date)
}

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncate(text: string, length = 90) {
  return text.length > length ? text.slice(0, length - 1) + '…' : text
}

/** Effective price for a product, applying the promo price when marked on sale. */
export function effectivePrice(p: { price: number; promo_price: number | null; is_promotion: boolean }) {
  return p.is_promotion && p.promo_price != null ? p.promo_price : p.price
}

export function discountPercent(price: number, promoPrice: number) {
  if (price <= 0) return 0
  return Math.round(((price - promoPrice) / price) * 100)
}
