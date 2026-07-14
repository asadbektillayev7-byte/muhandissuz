"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  pauseOnHover?: boolean;
  direction?: "left" | "right" | "up" | "down";
  fade?: boolean;
  fadeAmount?: number;
}

export function Marquee({
  children,
  className,
  duration = 20,
  pauseOnHover = false,
  direction = "left",
  fade = true,
  fadeAmount = 10,
  ...props
}: MarqueeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const id = React.useId();

  const items = React.Children.toArray(children);
  const isVertical = direction === "up" || direction === "down";
  const scrollerClass = `marquee-scroller-${id}`;

  const scrollName = `scroll-${id}`;
  const scrollReverseName = `scroll-reverse-${id}`;
  const scrollYName = `scroll-y-${id}`;
  const scrollYReverseName = `scroll-y-reverse-${id}`;

  return (
    <>
      <style>
        {`
        @keyframes ${scrollName} {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes ${scrollReverseName} {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes ${scrollYName} {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        @keyframes ${scrollYReverseName} {
          from { transform: translateY(-50%); }
          to { transform: translateY(0); }
        }
        .${scrollerClass} {
          display: flex;
          animation: ${
          isVertical
            ? (direction === "up" ? scrollYName : scrollYReverseName)
            : (direction === "left" ? scrollName : scrollReverseName)
        } ${duration}s linear infinite;
        }
        .${scrollerClass}.paused {
          animation-play-state: paused;
        }
      `}
      </style>
      <div
        ref={containerRef}
        className={cn("flex w-full overflow-hidden", isVertical && "flex-col", className)}
        style={{
          ...(fade && {
            maskImage: isVertical
              ? `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`,
            WebkitMaskImage: isVertical
              ? `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`,
          }),
        }}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        {...props}
      >
        <div className={cn(`${scrollerClass} flex shrink-0`, isVertical && "flex-col", isPaused && "paused")}>
          {items.map((item, index) => (
            <div key={`first-${index}`} className={cn("flex shrink-0", isVertical && "w-full")}>
              {item}
            </div>
          ))}
          {items.map((item, index) => (
            <div key={`second-${index}`} className={cn("flex shrink-0", isVertical && "w-full")}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
