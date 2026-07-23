"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EngineeringFlipHeadlineProps {
  lines: string[];
  intervalMs?: number;
  className?: string;
}

export function EngineeringFlipHeadline({
  lines,
  intervalMs = 2600,
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
    if (reduceMotion || lines.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % lines.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [lines.length, intervalMs, reduceMotion]);

  return (
    <motion.div layout className="overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.h1
          key={lines[index]}
          layout
          initial={reduceMotion ? false : { y: "30%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={reduceMotion ? undefined : { y: "-30%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            "font-bold leading-tight tracking-tight text-foreground",
            "text-5xl sm:text-6xl lg:text-7xl xl:text-8xl",
            className
          )}
        >
          {lines[index]}
        </motion.h1>
      </AnimatePresence>
    </motion.div>
  );
}
