'use client'

import { useEffect, useState } from 'react'
import { ArticleView } from '@/components/ArticleView'

export function ArticlePreview({ token, locale }: { token: string; locale: string }) {
  const [article, setArticle] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(`muhandiss:article-preview:${token}`) || 'null')
      if (!value?.article || typeof value.article !== 'object' || value.expires < Date.now()) throw new Error('Preview expired')
      setArticle(value.article)
    } catch { setError(true) }
  }, [token])
  if (error) return <p role="alert" className="mx-auto max-w-3xl px-4 py-12">Ko'rib chiqish nusxasi topilmadi yoki eskirgan. Muharrirdan qayta oching. / Preview is missing or expired. Open a new preview from the editor.</p>
  if (!article) return <p role="status" className="mx-auto max-w-3xl px-4 py-12">Yuklanmoqda / Loading…</p>
  return <ArticleView article={article} locale={locale} preview />
}
