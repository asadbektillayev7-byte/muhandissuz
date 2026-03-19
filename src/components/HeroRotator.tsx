import { useEffect, useRef, useState } from "react";
import HeroScene from "./HeroScene";

const INTERVAL_SECONDS = 6;

const departments = [
  { id: "mexanika", label: "Mexanika", color: "#e07b2a" },
  { id: "fuqarolik", label: "Fuqarolik", color: "#4caf82" },
  { id: "elektrotexnika", label: "Elektrotexnika", color: "#f5c518" },
  { id: "dasturiy", label: "Dasturiy ta'minot", color: "#7c6ee0" },
  { id: "kimyo", label: "Kimyo", color: "#3dd68c" },
  { id: "kosmik", label: "Kosmik sanoat", color: "#4060b0" },
  { id: "atrofmuhit", label: "Atrof-muhit", color: "#2ea855" },
  { id: "motosport", label: "Motosport", color: "#cc3333" },
];

export default function HeroRotator() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);

  useEffect(() => {
    const tick = setInterval(() => {
      elapsed.current += 1;
      setProgress((elapsed.current / INTERVAL_SECONDS) * 100);
      if (elapsed.current >= INTERVAL_SECONDS) {
        elapsed.current = 0;
        setProgress(0);
        setCurrent((prev) => (prev + 1) % departments.length);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const goTo = (index: number) => {
    elapsed.current = 0;
    setProgress(0);
    setCurrent(index);
  };

  const dept = departments[current];

  return (
    <div
      className="relative w-full h-[580px] overflow-hidden"
      style={{ background: "#060612" }}
    >
      {/* 3D Canvas */}
      <HeroScene departmentIndex={current} color={dept.color} />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(6,6,18,0.95) 0%, rgba(6,6,18,0.4) 50%, rgba(6,6,18,0.1) 100%)",
        }}
      />

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 px-10 pb-12 text-white z-10">
        <p
          className="text-xs font-medium tracking-widest uppercase mb-2"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {dept.label}
        </p>
        <h1 className="text-4xl font-semibold leading-tight mb-2">
          O'zbekistonda muhandislik kelajagini quramiz
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px" }}>
          Muhandislik sohasidagi eng so'nggi yangiliklar, ilmiy maqolalar va ta'lim resurslari
        </p>
        <button
          className="mt-5 px-6 py-3 rounded-lg font-medium text-white text-sm"
          style={{ backgroundColor: "#e07b2a" }}
        >
          Ko'proq bilish →
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 right-6 flex gap-2 z-10">
        {departments.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.35)",
              transform: i === current ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px] z-10"
        style={{
          width: `${progress}%`,
          backgroundColor: "#e07b2a",
          transition: "width 1s linear",
        }}
      />
    </div>
  );
}
