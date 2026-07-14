import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Muhandiss.uz',
  description: 'Muhandislik va texnologiyalar haqida maqolalar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
