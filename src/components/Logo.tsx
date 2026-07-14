import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo/muhandis-logo-new.png"
      alt="Muhandiss.uz"
      className={cn("h-7 w-auto shrink-0 dark:invert", className)}
    />
  )
}
