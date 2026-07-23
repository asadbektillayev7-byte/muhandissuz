"use client";

import { useEffect, useState } from "react";
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
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reduceMotion || words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs, reduceMotion]);

  return (
    <h1 className={cn("flex flex-wrap items-baseline gap-x-4 gap-y-2 font-bold leading-tight tracking-tight", className)}>
      <span className="inline-block overflow-hidden text-primary whitespace-nowrap text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            className="inline-block whitespace-nowrap"
            initial={reduceMotion ? false : { y: "40%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduceMotion ? undefined : { y: "-40%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="whitespace-normal text-muted-foreground text-lg sm:text-xl lg:text-2xl xl:text-3xl">
        {suffixText}
      </span>
    </h1>
  );
}
