import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

let configured = false

function ensureConfigured() {
  if (configured) return
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:suporte@joanastore.co.mz'
  if (!publicKey || !privateKey) return
  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

/**
 * Broadcasts a push notification to every subscribed device. Must be called
 * from an admin-authenticated request (the caller's Supabase client), since
 * store_push_subscriptions is only readable by store admins.
 */
export async function notifySubscribers(supabase: Awaited<ReturnType<typeof createClient>>, payload: PushPayload) {
  ensureConfigured()
  if (!configured) return { sent: 0, failed: 0 }

  const { data: subscriptions } = await supabase.from('store_push_subscriptions').select('endpoint, p256dh, auth')
  if (!subscriptions || subscriptions.length === 0) return { sent: 0, failed: 0 }

  let sent = 0
  let failed = 0

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        )
        sent += 1
      } catch (err) {
        failed += 1
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Subscription expired or was revoked by the browser — clean it up.
          await supabase.rpc('store_unsubscribe_push', { p_endpoint: sub.endpoint })
        }
      }
    })
  )

  return { sent, failed }
}
