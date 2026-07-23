'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteButton({ table, id, redirect }: { table: string; id: number | string; redirect: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this item? This cannot be undone.')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from(table).delete().eq('id', id)
    router.push(redirect)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:underline text-xs disabled:opacity-50"
    >
      {loading ? '...' : 'Delete'}
    </button>
  )
}
