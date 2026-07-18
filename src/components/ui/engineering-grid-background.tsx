// components/ui/engineering-grid-background.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface EngineeringGridBackgroundProps {
  className?: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface Trace {
  a: number;
  b: number;
  active: boolean;
  dashOffset: number;
}

const NODE_COUNT = 34;
const MAX_LINK_DIST = 170;
const GRID_SIZE = 42;

function readThemeVar(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return raw || fallback;
}

// Handles hex (#d0d0d0), raw HSL triplet ("217.2 32.6% 17.5%"), and pre-wrapped hsl(...) values.
function colorWithAlpha(raw: string, alpha: number): string {
  if (raw.startsWith("#")) {
    const hex = raw.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (raw.startsWith("hsl")) return raw;
  return `hsl(${raw} / ${alpha})`;
}

export function EngineeringGridBackground({ className }: EngineeringGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = reduceMotionQuery.matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    let borderVar = readThemeVar("--border", "217.2 32.6% 17.5%");
    let mutedVar = readThemeVar("--muted-foreground", "215 20.2% 65.1%");

    const themeObserver = new MutationObserver(() => {
      borderVar = readThemeVar("--border", borderVar);
      mutedVar = readThemeVar("--muted-foreground", mutedVar);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const nodes: Node[] = Array.from({ length: NODE_COUNT }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.004 + Math.random() * 0.006,
    }));

    let traces: Trace[] = [];
    function rebuildTraces() {
      traces = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < MAX_LINK_DIST) {
            traces.push({ a: i, b: j, active: false, dashOffset: 0 });
          }
        }
      }
    }
    rebuildTraces();

    let frame = 0;
    let raf = 0;
    let lastRebuild = 0;

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);

      // faint blueprint grid
      ctx!.strokeStyle = colorWithAlpha(borderVar, 0.25);
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      for (let x = 0; x < width; x += GRID_SIZE) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
      }
      for (let y = 0; y < height; y += GRID_SIZE) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
      }
      ctx!.stroke();

      if (!reduceMotion) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          n.pulsePhase += n.pulseSpeed;
        }
        if (time - lastRebuild > 3000) {
          rebuildTraces();
          lastRebuild = time;
        }
        if (frame % 90 === 0 && traces.length > 0) {
          for (let k = 0; k < Math.min(3, traces.length); k++) {
            traces[Math.floor(Math.random() * traces.length)].active = true;
          }
        }
      }

      for (const t of traces) {
        const a = nodes[t.a];
        const b = nodes[t.b];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const proximityAlpha = Math.max(0, 1 - dist / MAX_LINK_DIST) * 0.35;

        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);

        if (t.active && !reduceMotion) {
          ctx!.setLineDash([6, 10]);
          ctx!.lineDashOffset = -t.dashOffset;
          ctx!.strokeStyle = colorWithAlpha(mutedVar, Math.min(0.55, proximityAlpha + 0.25));
          ctx!.lineWidth = 1.2;
          t.dashOffset += 0.6;
          if (t.dashOffset > 400) t.active = false;
        } else {
          ctx!.setLineDash([]);
          ctx!.strokeStyle = colorWithAlpha(borderVar, proximityAlpha);
          ctx!.lineWidth = 1;
        }
        ctx!.stroke();
      }
      ctx!.setLineDash([]);

      for (const n of nodes) {
        const pulse = reduceMotion ? 0.5 : (Math.sin(n.pulsePhase) + 1) / 2;
        const radius = 1.6 + pulse * 1.4;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = colorWithAlpha(mutedVar, 0.25 + pulse * 0.35);
        ctx!.fill();

        if (!reduceMotion && pulse > 0.85) {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, radius + 4, 0, Math.PI * 2);
          ctx!.strokeStyle = colorWithAlpha(mutedVar, (pulse - 0.85) * 1.2);
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }

      frame++;
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    if (reduceMotion) {
      cancelAnimationFrame(raf);
      draw(0);
    }

    const handleReduceMotionChange = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches;
      cancelAnimationFrame(raf);
      if (reduceMotion) {
        draw(0);
      } else {
        raf = requestAnimationFrame(draw);
      }
    };
    reduceMotionQuery.addEventListener("change", handleReduceMotionChange);

    return () => {
      window.removeEventListener("resize", resize);
      reduceMotionQuery.removeEventListener("change", handleReduceMotionChange);
      themeObserver.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-1000",
        mounted ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}
