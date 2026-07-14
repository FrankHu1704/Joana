/**
 * The admin panel logs in with a phone number instead of an email. Supabase
 * Auth requires an email internally, so we map the phone number to a
 * synthetic, non-routable address deterministically. This mapping is not a
 * secret — only the account's password is — so it's safe to keep in source.
 */
export function phoneToAdminEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `${digits}@joanastore.internal`
}
