'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-4">
        <div className="border border-border p-8" style={{ borderRadius: 'var(--radius)' }}>
          <h1 className="text-2xl font-bold mb-1">Muhandiss.uz</h1>
          <p className="text-sm text-muted-foreground mb-6">Admin paneliga kirish</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
                style={{ borderRadius: 'var(--radius)' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
                style={{ borderRadius: 'var(--radius)' }}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error === 'Invalid login credentials' ? 'Email yoki parol noto\'g\'ri' : error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ borderRadius: 'var(--radius)' }}
            >
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
