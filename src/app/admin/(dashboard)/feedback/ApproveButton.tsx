'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminSetFeedbackApproved } from '@/lib/actions'

export function ApproveButton({ id, approved }: { id: number; approved: boolean }) {
  const router = useRouter()
  const [value, setValue] = useState(approved)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function toggle() {
    const next = !value
    setError('')
    startTransition(async () => {
      try {
        await adminSetFeedbackApproved(id, next)
        setValue(next)
        router.refresh()
      } catch (e: any) {
        setError(e?.message || 'Failed')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={error || (value ? 'Visible on the landing page' : 'Hidden from the site')}
      className={
        'border px-2 py-1 text-xs transition-colors duration-150 disabled:opacity-50 ' +
        (value
          ? 'border-chart-2 text-chart-2'
          : 'border-border text-muted-foreground hover:text-foreground')
      }
      style={{ borderRadius: 999 }}
    >
      {pending ? '…' : value ? 'Approved' : 'Approve'}
    </button>
  )
}
