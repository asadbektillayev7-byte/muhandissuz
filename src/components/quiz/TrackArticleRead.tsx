'use client'

import { useEffect } from 'react'
import { recordArticleRead } from '@/lib/quiz'

/**
 * Records that this article was opened, in localStorage only. Feeds the
 * Continue Learning section on /quiz. Renders nothing and sends nothing.
 */
export function TrackArticleRead({
  articleId,
  categoryId,
}: {
  articleId: number
  categoryId: number | null
}) {
  useEffect(() => {
    recordArticleRead(articleId, categoryId)
  }, [articleId, categoryId])

  return null
}
