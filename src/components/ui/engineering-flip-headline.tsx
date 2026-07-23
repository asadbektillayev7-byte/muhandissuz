"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EngineeringFlipHeadlineProps {
  words: string[];
  suffixText: string;
  intervalMs?: number;
  className?: string;
}

export function EngineeringFlipHeadline({
  words,
  suffixText,
  intervalMs = 2200,
  className,
}: EngineeringFlipHeadlineProps) {
  const [index, setIndex] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [boxSize, setBoxSize] = useState<{ width: number; height: number } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!measureRef.current) return;
    let maxWidth = 0;
    let maxHeight = 0;
    words.forEach((word) => {
      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.visibility = "hidden";
      span.style.whiteSpace = "nowrap";
      span.className = measureRef.current!.className;
      span.textContent = word;
      document.body.appendChild(span);
      maxWidth = Math.max(maxWidth, span.offsetWidth);
      maxHeight = Math.max(maxHeight, span.offsetHeight);
      document.body.removeChild(span);
    });
    setBoxSize({ width: maxWidth, height: maxHeight });
  }, [words]);

  useEffect(() => {
    if (reduceMotion || words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs, reduceMotion]);

  return (
    <h1
      className={cn(
        "flex flex-wrap items-baseline gap-x-3 gap-y-1 font-bold leading-tight tracking-tight",
        "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl",
        className
      )}
    >
      <span
        className="relative inline-block overflow-hidden align-baseline text-primary"
        style={boxSize ? { width: boxSize.width, height: boxSize.height } : undefined}
      >
        <span ref={measureRef} className="invisible absolute whitespace-nowrap">
          {words[0]}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            className="absolute left-0 top-0 whitespace-nowrap"
            initial={reduceMotion ? false : { y: "40%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduceMotion ? undefined : { y: "-40%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="whitespace-normal text-foreground">{suffixText}</span>
    </h1>
  );
}
