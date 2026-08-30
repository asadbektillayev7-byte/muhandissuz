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
      {/*
        The rotating word carries the accent colour; the fixed suffix stays
        muted. Every word is stacked in one grid cell, so the cell is always
        as wide as the longest of them and the suffix never shifts sideways
        when the word changes. The sizers are hidden but still take up space,
        which is what makes the reservation work — and it costs no measuring
        pass, so it survives any font, locale or word list.
      */}
      <span className="grid justify-items-start text-accent text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
        {words.map((word) => (
          <span
            key={`sizer-${word}`}
            aria-hidden="true"
            className="invisible col-start-1 row-start-1 whitespace-nowrap"
          >
            {word}
          </span>
        ))}
        {/* The clip that hides the sliding word lives here, not on the grid:
            overflow-hidden on a flex item forces min-width:0, which collapses
            the reserved width to nothing. */}
        <span className="col-start-1 row-start-1 overflow-hidden whitespace-nowrap">
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
      </span>
      <span className="whitespace-normal text-muted-foreground text-lg sm:text-xl lg:text-2xl xl:text-3xl">
        {suffixText}
      </span>
    </h1>
  );
}
