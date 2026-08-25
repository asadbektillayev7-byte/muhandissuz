import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-6", className)} {...props} />
  )
}

export { Card, CardContent, LiquidCard }

function LiquidCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="">
      <div
        data-slot="card"
        style={{ backdropFilter: 'url("#container-glass")' }}
        className={cn(
          // Option B: the soft outer depth is kept, but every inset highlight
          // is gone. Those insets were what drew the bright rim in dark mode
          // (and the equally heavy dark rim in light mode).
          "text-card-foreground bg-card flex flex-col gap-6 rounded-xl border py-6 transition-all",
          "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),0_0_12px_rgba(0,0,0,0.10)]",
          className
        )}
        {...props}
      />
      <GlassFilter />
    </div>
  )
}

function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter id="container-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="120" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
