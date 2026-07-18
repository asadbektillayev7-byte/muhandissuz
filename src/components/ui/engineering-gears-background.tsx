// components/ui/engineering-gears-background.tsx
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface EngineeringGearsBackgroundProps {
  className?: string;
}

function resolveCssVarColor(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) return fallback;
  if (raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl")) return raw;
  // Handles shadcn/Tailwind's raw HSL-triplet CSS variable convention, e.g. "217.2 32.6% 17.5%"
  const parts = raw.split(/\s+/);
  if (parts.length === 3) return `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`;
  return raw;
}

export function EngineeringGearsBackground({ className }: EngineeringGearsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const cleanupFns: Array<() => void> = [];

    (async () => {
      const THREE = await import("three");
      if (disposed || !container) return;

      const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      let reduceMotion = reduceMotionQuery.matches;

      let width = container.clientWidth;
      let height = container.clientHeight;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch (e) {
        console.warn("WebGL unavailable, skipping 3D background:", e);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      Object.assign(renderer.domElement.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      });
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 14;

      function polar(r: number, a: number) {
        return { x: r * Math.cos(a), y: r * Math.sin(a) };
      }

      function createGearGeometry(
        teeth: number,
        outerRadius: number,
        rootRadius: number,
        boreRadius: number,
        thickness: number
      ) {
        const shape = new THREE.Shape();
        const toothAngle = (Math.PI * 2) / teeth;

        for (let i = 0; i < teeth; i++) {
          const a0 = i * toothAngle;
          const a1 = a0 + toothAngle * 0.28;
          const a2 = a0 + toothAngle * 0.5;
          const a3 = a0 + toothAngle * 0.72;

          const p0 = polar(rootRadius, a0);
          const p1 = polar(outerRadius, a1);
          const p2 = polar(outerRadius, a2);
          const p3 = polar(rootRadius, a3);

          if (i === 0) shape.moveTo(p0.x, p0.y);
          else shape.lineTo(p0.x, p0.y);
          shape.lineTo(p1.x, p1.y);
          shape.lineTo(p2.x, p2.y);
          shape.lineTo(p3.x, p3.y);
        }
        shape.closePath();

        const holePath = new THREE.Path();
        holePath.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
        shape.holes.push(holePath);

        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: thickness,
          bevelEnabled: false,
          curveSegments: 12,
        });
        geometry.center();
        return geometry;
      }

      const fillColor = resolveCssVarColor("--muted-foreground", "#8a8a8a");
      const lineColor = resolveCssVarColor("--border", "#d0d0d0");

      const fillMaterial = new THREE.MeshBasicMaterial({
        color: fillColor,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const lineMaterial = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.4,
      });

      interface GearInstance {
        group: InstanceType<typeof THREE.Group>;
        spinSpeed: number;
        drift: { x: number; y: number };
        bounds: { x: number; y: number };
      }

      const gearConfigs = [
        { teeth: 10, radius: 1.6, z: -2 },
        { teeth: 8, radius: 1.1, z: 1 },
        { teeth: 14, radius: 2.2, z: -4 },
        { teeth: 6, radius: 0.8, z: 2 },
        { teeth: 12, radius: 1.8, z: -1 },
      ];

      const gears: GearInstance[] = gearConfigs.map((cfg, i) => {
        const geometry = createGearGeometry(
          cfg.teeth,
          cfg.radius,
          cfg.radius * 0.78,
          cfg.radius * 0.22,
          cfg.radius * 0.18
        );
        const mesh = new THREE.Mesh(geometry, fillMaterial);
        const edges = new THREE.EdgesGeometry(geometry, 15);
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        mesh.add(wireframe);

        const group = new THREE.Group();
        group.add(mesh);

        const spread = 6;
        group.position.set(
          (Math.random() - 0.5) * spread * 2,
          (Math.random() - 0.5) * spread,
          cfg.z
        );
        group.rotation.set(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8,
          Math.random() * Math.PI * 2
        );

        scene.add(group);

        return {
          group,
          spinSpeed: (Math.random() * 0.004 + 0.0015) * (i % 2 === 0 ? 1 : -1),
          drift: {
            x: (Math.random() - 0.5) * 0.004,
            y: (Math.random() - 0.5) * 0.004,
          },
          bounds: { x: spread, y: spread / 2 },
        };
      });

      function resize() {
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      window.addEventListener("resize", resize);
      cleanupFns.push(() => window.removeEventListener("resize", resize));

      const themeObserver = new MutationObserver(() => {
        fillMaterial.color.set(resolveCssVarColor("--muted-foreground", "#8a8a8a"));
        lineMaterial.color.set(resolveCssVarColor("--border", "#d0d0d0"));
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      cleanupFns.push(() => themeObserver.disconnect());

      let raf = 0;
      function animate() {
        if (!reduceMotion) {
          for (const g of gears) {
            g.group.rotation.z += g.spinSpeed;
            g.group.position.x += g.drift.x;
            g.group.position.y += g.drift.y;
            if (Math.abs(g.group.position.x) > g.bounds.x) g.drift.x *= -1;
            if (Math.abs(g.group.position.y) > g.bounds.y) g.drift.y *= -1;
          }
          raf = requestAnimationFrame(animate);
        }
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(animate);

      const handleReduceMotionChange = (e: MediaQueryListEvent) => {
        reduceMotion = e.matches;
        cancelAnimationFrame(raf);
        if (!reduceMotion) raf = requestAnimationFrame(animate);
        else renderer.render(scene, camera);
      };
      reduceMotionQuery.addEventListener("change", handleReduceMotionChange);
      cleanupFns.push(() => reduceMotionQuery.removeEventListener("change", handleReduceMotionChange));

      cleanupFns.push(() => {
        cancelAnimationFrame(raf);
        gears.forEach((g) => {
          g.group.traverse((obj) => {
            if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
              obj.geometry.dispose();
            }
          });
        });
        fillMaterial.dispose();
        lineMaterial.dispose();
        renderer.dispose();
        if (renderer.domElement.parentElement === container) {
          container.removeChild(renderer.domElement);
        }
      });
    })();

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
