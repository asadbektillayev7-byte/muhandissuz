import localFont from 'next/font/local'

// Display face for hero + section headings only. Body text, the article
// reader, quiz and admin keep the default stack.
export const switzer = localFont({
  src: '../../public/fonts/Switzer-Variable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-display',
  preload: true,
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})
