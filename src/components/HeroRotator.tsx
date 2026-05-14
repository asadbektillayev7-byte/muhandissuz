import { useEffect, useRef, useState } from "react";

const INTERVAL_SECONDS = 15;

const departments = [
  {
    id: "mexanika", label: "Mexanika", bg: "#1a1a2e",
    svg: () => (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes spinR{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
          @keyframes pulse{0%,100%{opacity:.7}50%{opacity:1}}
          .g1{transform-origin:340px 170px;animation:spin 4s linear infinite}
          .g2{transform-origin:220px 120px;animation:spinR 3s linear infinite}
          .g3{transform-origin:460px 220px;animation:spinR 5s linear infinite}
          .core{animation:pulse 2s ease-in-out infinite}
        `}</style>
        <g className="g1">
          <circle cx="340" cy="170" r="110" fill="none" stroke="#e07b2a" strokeWidth="3" strokeDasharray="8 4"/>
          <circle cx="340" cy="170" r="75" fill="none" stroke="#e07b2a" strokeWidth="2" opacity=".5"/>
          <circle cx="340" cy="170" r="38" fill="#2a2a4a" stroke="#e07b2a" strokeWidth="2"/>
          <rect x="325" y="130" width="30" height="12" rx="3" fill="#e07b2a"/>
          <rect x="325" y="198" width="30" height="12" rx="3" fill="#e07b2a"/>
          <rect x="305" y="155" width="12" height="30" rx="3" fill="#e07b2a"/>
          <rect x="363" y="155" width="12" height="30" rx="3" fill="#e07b2a"/>
        </g>
        <circle cx="340" cy="170" r="16" fill="#e07b2a" className="core"/>
        <g className="g2">
          <circle cx="220" cy="120" r="28" fill="#2a2a4a" stroke="#c0c0c0" strokeWidth="1.5"/>
          <circle cx="220" cy="120" r="10" fill="#c0c0c0" opacity=".6"/>
          <rect x="208" y="93" width="24" height="8" rx="2" fill="#c0c0c0" opacity=".7"/>
          <rect x="208" y="119" width="24" height="8" rx="2" fill="#c0c0c0" opacity=".7"/>
          <rect x="193" y="108" width="8" height="24" rx="2" fill="#c0c0c0" opacity=".7"/>
          <rect x="219" y="108" width="8" height="24" rx="2" fill="#c0c0c0" opacity=".7"/>
        </g>
        <g className="g3">
          <circle cx="460" cy="220" r="32" fill="#2a2a4a" stroke="#c0c0c0" strokeWidth="1.5"/>
          <circle cx="460" cy="220" r="12" fill="#c0c0c0" opacity=".6"/>
          <rect x="448" y="190" width="24" height="8" rx="2" fill="#c0c0c0" opacity=".7"/>
          <rect x="448" y="222" width="24" height="8" rx="2" fill="#c0c0c0" opacity=".7"/>
          <rect x="429" y="208" width="8" height="24" rx="2" fill="#c0c0c0" opacity=".7"/>
          <rect x="457" y="208" width="8" height="24" rx="2" fill="#c0c0c0" opacity=".7"/>
        </g>
      </svg>
    ),
  },
  {
    id: "elektrotexnika", label: "Elektrotexnika", bg: "#0d1a2a",
    svg: () => (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes boltPulse{0%,100%{opacity:1;filter:drop-shadow(0 0 10px #f5c518)}50%{opacity:.5;filter:drop-shadow(0 0 2px #f5c518)}}
          @keyframes orb{from{transform:rotate(0deg) translateX(120px) rotate(0deg)}to{transform:rotate(360deg) translateX(120px) rotate(-360deg)}}
          @keyframes orb2{from{transform:rotate(180deg) translateX(80px) rotate(-180deg)}to{transform:rotate(540deg) translateX(80px) rotate(-540deg)}}
          .bolt{animation:boltPulse 1.5s ease-in-out infinite}
          .o1{transform-origin:340px 185px;animation:orb 4s linear infinite}
          .o2{transform-origin:340px 185px;animation:orb2 3s linear infinite}
        `}</style>
        <circle cx="340" cy="185" r="120" fill="none" stroke="#f5c518" strokeWidth="1" opacity=".2" strokeDasharray="6 6"/>
        <circle cx="340" cy="185" r="80" fill="none" stroke="#f5c518" strokeWidth=".8" opacity=".3"/>
        <g className="bolt">
          <polygon points="340,80 290,190 330,190 270,290 390,160 345,160" fill="#f5c518" opacity=".9"/>
        </g>
        <circle cx="340" cy="185" r="8" fill="#f5c518" className="o1"/>
        <circle cx="340" cy="185" r="6" fill="white" opacity=".8" className="o2"/>
      </svg>
    ),
  },
  {
    id: "dasturiy", label: "Dasturiy ta'minot", bg: "#0e0e1a",
    svg: () => (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes appear{0%,100%{opacity:0}20%,80%{opacity:1}}
          @keyframes appear2{0%,20%{opacity:0}40%,80%{opacity:1}}
          @keyframes appear3{0%,40%{opacity:0}60%,80%{opacity:1}}
          @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
          @keyframes scan{0%{transform:translateY(0)}100%{transform:translateY(200px)}}
          .l1{animation:appear 4s ease infinite}
          .l2{animation:appear2 4s ease infinite}
          .l3{animation:appear3 4s ease infinite}
          .cursor{animation:blink 1s step-end infinite}
          .scanline{animation:scan 2s linear infinite;opacity:.06}
        `}</style>
        <rect x="160" y="70" width="360" height="220" rx="8" fill="#141428" stroke="#7c6ee0" strokeWidth="1.5"/>
        <rect x="160" y="70" width="360" height="28" rx="8" fill="#1e1e40"/>
        <circle cx="180" cy="84" r="5" fill="#e05555"/>
        <circle cx="198" cy="84" r="5" fill="#e0c055"/>
        <circle cx="216" cy="84" r="5" fill="#55e070"/>
        <rect x="160" y="98" width="360" height="3" fill="#7c6ee0" className="scanline"/>
        <text x="178" y="118" fill="#7c6ee0" fontSize="13" fontFamily="monospace" className="l1">&lt;muhandis platform=</text>
        <text x="178" y="145" fill="#e0c055" fontSize="13" fontFamily="monospace" className="l2">  "engineering" /&gt;</text>
        <text x="178" y="175" fill="#55e0c0" fontSize="13" fontFamily="monospace" className="l3">const future = build();</text>
        <rect x="178" y="255" width="2" height="16" fill="#7c6ee0" className="cursor"/>
      </svg>
    ),
  },
  {
    id: "kimyo", label: "Kimyo", bg: "#0e1a12",
    svg: () => (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes orbitA{from{transform:rotate(0deg) translateX(90px) rotate(0deg)}to{transform:rotate(360deg) translateX(90px) rotate(-360deg)}}
          @keyframes orbitB{from{transform:rotate(120deg) translateX(120px) rotate(-120deg)}to{transform:rotate(480deg) translateX(120px) rotate(-480deg)}}
          @keyframes orbitC{from{transform:rotate(240deg) translateX(60px) rotate(-240deg)}to{transform:rotate(600deg) translateX(60px) rotate(-600deg)}}
          @keyframes glow{0%,100%{filter:drop-shadow(0 0 6px #3dd68c)}50%{filter:drop-shadow(0 0 16px #3dd68c)}}
          .oa{transform-origin:340px 160px;animation:orbitA 5s linear infinite}
          .ob{transform-origin:340px 160px;animation:orbitB 7s linear infinite}
          .oc{transform-origin:340px 160px;animation:orbitC 3s linear infinite}
          .nucleus{animation:glow 2s ease-in-out infinite}
        `}</style>
        <circle cx="340" cy="160" r="120" fill="none" stroke="#3dd68c" strokeWidth=".5" opacity=".15" strokeDasharray="3 7"/>
        <circle cx="340" cy="160" r="70" fill="none" stroke="#3dd68c" strokeWidth=".5" opacity=".2" strokeDasharray="5 5"/>
        <circle cx="340" cy="160" r="28" fill="#1a4a2a" stroke="#3dd68c" strokeWidth="2" className="nucleus"/>
        <text x="340" y="165" textAnchor="middle" fill="#3dd68c" fontSize="13" fontFamily="monospace">H₂O</text>
        <circle cx="340" cy="160" r="14" fill="#1a4a2a" stroke="#3dd68c" strokeWidth="1.5" className="oa"/>
        <circle cx="340" cy="160" r="18" fill="#1a4a2a" stroke="#3dd68c" strokeWidth="1.5" className="ob"/>
        <circle cx="340" cy="160" r="10" fill="#1a4a2a" stroke="#3dd68c" strokeWidth="1" className="oc"/>
      </svg>
    ),
  },
  {
    id: "kosmik", label: "Kosmik sanoat", bg: "#06060f",
    svg: () => (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:1}}
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
          @keyframes ringRotate{from{transform-origin:550px 160px;transform:rotateX(70deg) rotate(0deg)}to{transform-origin:550px 160px;transform:rotateX(70deg) rotate(360deg)}}
          .s1{animation:twinkle 2s ease-in-out infinite}
          .s2{animation:twinkle 3s ease-in-out infinite .5s}
          .s3{animation:twinkle 1.5s ease-in-out infinite 1s}
          .rocket{animation:float 3s ease-in-out infinite}
          .planetRing{transform-origin:550px 160px;animation:ringRotate 6s linear infinite}
        `}</style>
        <circle cx="120" cy="80" r="2" fill="white" className="s1"/>
        <circle cx="200" cy="40" r="1.5" fill="white" className="s2"/>
        <circle cx="560" cy="60" r="2" fill="white" className="s3"/>
        <circle cx="80" cy="200" r="1" fill="white" className="s1"/>
        <circle cx="440" cy="30" r="1" fill="white" className="s2"/>
        <circle cx="160" cy="160" r="1.5" fill="white" className="s3"/>
        <g className="rocket">
          <polygon points="340,80 300,220 340,200 380,220" fill="#c0c8e0" stroke="#a0aac8" strokeWidth="1"/>
          <polygon points="340,140 250,200 260,215 340,180" fill="#9099b0" opacity=".9"/>
          <polygon points="340,140 430,200 420,215 340,180" fill="#9099b0" opacity=".9"/>
          <ellipse cx="340" cy="130" rx="12" ry="8" fill="#7090c0"/>
          <polygon points="340,198 328,222 352,222" fill="#ff7043" opacity=".9"/>
          <ellipse cx="340" cy="226" rx="10" ry="5" fill="#ff7043" opacity=".3"/>
        </g>
        <circle cx="550" cy="160" r="35" fill="#1a2040" stroke="#3050a0" strokeWidth="1.5"/>
        <circle cx="550" cy="160" r="8" fill="#3050a0"/>
        <ellipse cx="550" cy="160" rx="52" ry="15" fill="none" stroke="#4060b0" strokeWidth="2" opacity=".6" className="planetRing"/>
      </svg>
    ),
  },
  {
    id: "atrofmuhit", label: "Atrof-muhit", bg: "#071a0e",
    svg: () => (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes sway{0%,100%{transform-origin:340px 280px;transform:rotate(-3deg)}50%{transform-origin:340px 280px;transform:rotate(3deg)}}
          @keyframes sway2{0%,100%{transform-origin:200px 280px;transform:rotate(-5deg)}50%{transform-origin:200px 280px;transform:rotate(5deg)}}
          @keyframes cloudDrift{0%{transform:translateX(0)}100%{transform:translateX(25px)}}
          @keyframes sunGlow{0%,100%{filter:drop-shadow(0 0 6px #2ea855)}50%{filter:drop-shadow(0 0 18px #2ea855)}}
          .tree1{animation:sway 4s ease-in-out infinite}
          .tree2{animation:sway2 5s ease-in-out infinite}
          .cloud{animation:cloudDrift 6s ease-in-out infinite alternate}
          .sun{animation:sunGlow 3s ease-in-out infinite}
        `}</style>
        <ellipse cx="340" cy="200" rx="200" ry="80" fill="#0a2a14" stroke="#2ea855" strokeWidth="1.5"/>
        <g className="cloud">
          <ellipse cx="180" cy="80" rx="40" ry="18" fill="#1a3a22" stroke="#2ea855" strokeWidth="1" opacity=".6"/>
          <ellipse cx="210" cy="70" rx="28" ry="16" fill="#1a3a22" stroke="#2ea855" strokeWidth="1" opacity=".6"/>
        </g>
        <circle cx="500" cy="70" r="22" fill="#1a4a22" stroke="#2ea855" strokeWidth="1.5" className="sun"/>
        <g className="tree1">
          <line x1="340" y1="175" x2="340" y2="280" stroke="#1a6630" strokeWidth="3"/>
          <path d="M340,80 Q380,120 370,170 Q410,130 440,150 Q400,90 380,80 Q360,70 340,80Z" fill="#2ea855" opacity=".8"/>
          <path d="M340,80 Q300,120 310,170 Q270,130 240,150 Q280,90 300,80 Q320,70 340,80Z" fill="#2ea855" opacity=".7"/>
        </g>
        <g className="tree2">
          <line x1="200" y1="130" x2="200" y2="280" stroke="#1a6630" strokeWidth="2"/>
          <circle cx="200" cy="110" r="22" fill="#1a3a22" stroke="#2ea855" strokeWidth="1"/>
        </g>
      </svg>
    ),
  },
  {
    id: "motosport", label: "Motosport", bg: "#0e0a04",
    svg: () => (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes drive{0%{transform:translateX(300px);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(-300px);opacity:0}}
          @keyframes w1spin{from{transform-origin:240px 235px;transform:rotate(0deg)}to{transform-origin:240px 235px;transform:rotate(360deg)}}
          @keyframes w2spin{from{transform-origin:460px 235px;transform:rotate(0deg)}to{transform-origin:460px 235px;transform:rotate(360deg)}}
          .car{animation:drive 3s ease-in-out infinite}
          .w1{animation:w1spin .4s linear infinite}
          .w2{animation:w2spin .4s linear infinite}
        `}</style>
        <line x1="60" y1="270" x2="620" y2="270" stroke="#555" strokeWidth="2"/>
        <line x1="60" y1="260" x2="620" y2="260" stroke="#e07b2a" strokeWidth=".5" opacity=".3" strokeDasharray="20 10"/>
        <g className="car">
          <rect x="200" y="185" width="280" height="50" rx="12" fill="#1a1004" stroke="#e07b2a" strokeWidth="1.5"/>
          <rect x="220" y="193" width="240" height="18" rx="4" fill="#2a1808"/>
          <polygon points="430,185 460,155 490,185" fill="#cc3333" opacity=".8"/>
          <rect x="260" y="165" width="80" height="22" rx="4" fill="#cc3333" opacity=".7"/>
        </g>
        <g className="w1">
          <ellipse cx="240" cy="235" rx="28" ry="28" fill="#1a1004" stroke="#e07b2a" strokeWidth="2.5"/>
          <ellipse cx="240" cy="235" rx="14" ry="14" fill="#2a1808" stroke="#e07b2a" strokeWidth="1.5"/>
          <circle cx="240" cy="235" r="5" fill="#e07b2a"/>
          <line x1="240" y1="221" x2="240" y2="249" stroke="#e07b2a" strokeWidth="1.5"/>
          <line x1="226" y1="235" x2="254" y2="235" stroke="#e07b2a" strokeWidth="1.5"/>
        </g>
        <g className="w2">
          <ellipse cx="460" cy="235" rx="28" ry="28" fill="#1a1004" stroke="#e07b2a" strokeWidth="2.5"/>
          <ellipse cx="460" cy="235" rx="14" ry="14" fill="#2a1808" stroke="#e07b2a" strokeWidth="1.5"/>
          <circle cx="460" cy="235" r="5" fill="#e07b2a"/>
          <line x1="460" y1="221" x2="460" y2="249" stroke="#e07b2a" strokeWidth="1.5"/>
          <line x1="446" y1="235" x2="474" y2="235" stroke="#e07b2a" strokeWidth="1.5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "fuqarolik", label: "Fuqarolik", bg: "#0d1f12",
    svg: () => (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes rise1{0%{transform:scaleY(0);transform-origin:bottom}100%{transform:scaleY(1);transform-origin:bottom}}
          @keyframes rise2{0%,25%{transform:scaleY(0);transform-origin:bottom}100%{transform:scaleY(1);transform-origin:bottom}}
          @keyframes rise3{0%,50%{transform:scaleY(0);transform-origin:bottom}100%{transform:scaleY(1);transform-origin:bottom}}
          @keyframes craneSway{0%,100%{transform-origin:500px 100px;transform:rotate(-4deg)}50%{transform-origin:500px 100px;transform:rotate(4deg)}}
          .b1{animation:rise1 2s ease-out forwards}
          .b2{animation:rise2 2s ease-out forwards}
          .b3{animation:rise3 2s ease-out forwards}
          .crane{animation:craneSway 3s ease-in-out infinite}
        `}</style>
        <line x1="60" y1="280" x2="620" y2="280" stroke="#4caf82" strokeWidth="3" opacity=".6"/>
        <g className="b1">
          <rect x="290" y="200" width="100" height="80" fill="#1a3a22" stroke="#4caf82" strokeWidth="1.5"/>
          <rect x="315" y="225" width="50" height="55" fill="none" stroke="#4caf82" strokeWidth="1" opacity=".6"/>
        </g>
        <g className="b2">
          <rect x="80" y="180" width="70" height="100" fill="#1a3a22" stroke="#4caf82" strokeWidth="1.5"/>
        </g>
        <g className="b3">
          <rect x="560" y="210" width="55" height="70" fill="#1a3a22" stroke="#4caf82" strokeWidth="1.5"/>
        </g>
        <g className="crane">
          <line x1="500" y1="100" x2="500" y2="210" stroke="#4caf82" strokeWidth="2"/>
          <line x1="460" y1="100" x2="560" y2="100" stroke="#4caf82" strokeWidth="2"/>
          <line x1="540" y1="100" x2="540" y2="150" stroke="#4caf82" strokeWidth="1.5" strokeDasharray="4 3"/>
        </g>
      </svg>
    ),
  },
];

export default function HeroRotator() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const elapsed = useRef(0);

  useEffect(() => {
  document.body.style.backgroundColor = "#060612";
  document.documentElement.style.backgroundColor = "#060612";
  setMounted(true);
  return () => {
    document.body.style.backgroundColor = "";
    document.documentElement.style.backgroundColor = "";
  };
}, []);

  const changeTo = (index: number) => {
    if (index === current || transitioning) return;
    setPrev(current);
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setPrev(null);
      setTransitioning(false);
      elapsed.current = 0;
    }, 600);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      elapsed.current += 1;
      if (elapsed.current >= INTERVAL_SECONDS) {
        elapsed.current = 0;
        changeTo((current + 1) % departments.length);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [current, transitioning]);

  const dept = departments[current];
  const prevDept = prev !== null ? departments[prev] : null;

  return (
 <div className="relative w-full h-[580px] overflow-hidden" style={{ backgroundColor: "#060612", opacity: mounted ? 1 : 0, transition: "opacity 0.3s ease" }}>

      {/* Previous slide fading out */}
      {prevDept && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: prevDept.bg,
            opacity: transitioning ? 0 : 1,
            transition: "opacity 0.6s ease",
          }}
        >
          {prevDept.svg()}
        </div>
      )}

      {/* Current slide fading in */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: dept.bg,
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.6s ease",
        }}
      >
        {dept.svg()}
      </div>

      {/* Gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.05) 100%)",
        }}
      />

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 px-10 pb-12 text-white z-20">
        <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
          {dept.label}
        </p>
        <h1 className="text-4xl font-semibold leading-tight mb-2">
          O'zbekistonda muhandislik kelajagini quramiz
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px" }}>
          Muhandislik sohasidagi eng so'nggi yangiliklar, ilmiy maqolalar va ta'lim resurslari
        </p>
        <button className="mt-5 px-6 py-3 rounded-lg font-medium text-white text-sm" style={{ backgroundColor: "#e07b2a" }}>
          Ko'proq bilish →
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 right-6 flex gap-2 z-20">
        {departments.map((_, i) => (
          <button
            key={i}
            onClick={() => changeTo(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.35)",
              transform: i === current ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
