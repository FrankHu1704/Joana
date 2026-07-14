'use client'

import { useTrackView } from '@/hooks/use-track-view'

export function TrackPageView({ path, productId, categoryId }: { path: string; productId?: string; categoryId?: string }) {
  useTrackView({ path, productId, categoryId })
  return null
}
