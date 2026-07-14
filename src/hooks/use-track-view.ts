'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/track-visit'

interface TrackViewOptions {
  path: string
  productId?: string
  categoryId?: string
}

/** Records a page view (and bumps the product's view counter, if any) once per mount. */
export function useTrackView({ path, productId, categoryId }: TrackViewOptions) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    const supabase = createClient()
    supabase
      .rpc('store_track_view', {
        p_session_id: getSessionId(),
        p_path: path,
        p_product_id: productId ?? null,
        p_category_id: categoryId ?? null,
        p_referrer: document.referrer || null,
        p_user_agent: navigator.userAgent,
      })
      .then(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, productId, categoryId])
}
