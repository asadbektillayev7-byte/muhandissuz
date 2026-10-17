'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { MurvachchaMascot, type MurvachchaState } from '@/components/MurvachchaMascot'

const states: MurvachchaState[] = ['idle', 'greeting', 'listening', 'thinking', 'dragging']

export default function AvatarPreviewPage() {
  const params = useParams()
  const uz = params?.locale !== 'en'
  const [state, setState] = useState<MurvachchaState>('idle')
  const labels = uz
    ? { idle: 'Tayyor', greeting: 'Salomlashmoqda', listening: 'Tinglamoqda', thinking: 'O‘ylamoqda', dragging: 'Ko‘chirilmoqda' }
    : { idle: 'Ready', greeting: 'Greeting', listening: 'Listening', thinking: 'Thinking', dragging: 'Being moved' }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-36 pt-16">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-chart-2">Muhandiss.uz</p>
      <h1 className="font-display text-3xl font-bold">{uz ? 'Murvachcha bilan tanishing' : 'Meet Murvachcha'}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {uz
          ? 'Kichik muhandis, katta qiziqish. Ustiga borsangiz salomlashadi. Sahifa burchagidagi Murvachchani bosib suhbatni oching yoki ushlab, qulay joyga ko‘chiring.'
          : 'A little engineer with a lot of curiosity. Hover to say hello. Click Murvachcha in the corner to chat, or drag him somewhere comfortable.'}
      </p>
      <div className="mt-8 flex flex-wrap gap-2" aria-label={uz ? 'Harakatlar' : 'Character states'}>
        {states.map(value => (
          <button key={value} type="button" onClick={() => setState(value)} aria-pressed={state === value}
            className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart-2 ${state === value ? 'border-chart-2 bg-chart-2/10 text-chart-2' : 'border-border text-muted-foreground hover:border-chart-2 hover:text-foreground'}`}>
            {labels[value]}
          </button>
        ))}
      </div>
      <div className="mt-6 grid overflow-hidden rounded-2xl border border-border sm:grid-cols-2">
        <div className="flex min-h-72 flex-col items-center justify-center gap-6 bg-[#f4f8fb] p-8 text-[#16334b]">
          <div className="murvachcha-control h-48 w-36"><MurvachchaMascot state={state} /></div>
          <span className="text-xs">{uz ? 'Yorug‘ ko‘rinish' : 'Light appearance'}</span>
        </div>
        <div className="dark flex min-h-72 flex-col items-center justify-center gap-6 bg-[#101b2b] p-8 text-[#e5f3ff]">
          <div className="murvachcha-control h-48 w-36"><MurvachchaMascot state={state} /></div>
          <span className="text-xs">{uz ? 'Tungi ko‘rinish' : 'Dark appearance'}</span>
        </div>
      </div>
      <p className="mt-5 text-xs leading-6 text-muted-foreground">
        {uz
          ? 'Klaviatura: Tab orqali Murvachchani tanlang. Alt + yo‘nalish tugmalari bilan ko‘chiring, Home bilan joyiga qaytaring. Qurilmangizda harakatni kamaytirish yoqilgan bo‘lsa, u tinch turadi.'
          : 'Keyboard: Tab to Murvachcha. Use Alt + arrow keys to move and Home to reset. He stays still when your device requests reduced motion.'}
      </p>
    </div>
  )
}
