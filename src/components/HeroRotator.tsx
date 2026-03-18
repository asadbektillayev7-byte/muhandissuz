import { useEffect, useRef, useState } from "react";

const INTERVAL_SECONDS = 6;

const departments = [
  {
    id: "mexanika",
    label: "Mexanika",
    bg: "#1a1a2e",
    svg: (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="340" cy="170" r="110" fill="none" stroke="#e07b2a" strokeWidth="3" strokeDasharray="8 4" />
        <circle cx="340" cy="170" r="75" fill="none" stroke="#e07b2a" strokeWidth="2" opacity={0.5} />
        <circle cx="340" cy="170" r="38" fill="#2a2a4a" stroke="#e07b2a" strokeWidth="2" />
        <circle cx="340" cy="170" r="16" fill="#e07b2a" opacity={0.7} />
        <rect x="325" y="130" width="30" height="12" rx="3" fill="#e07b2a" />
        <rect x="325" y="198" width="30" height="12" rx="3" fill="#e07b2a" />
        <rect x="305" y="155" width="12" height="30" rx="3" fill="#e07b2a" />
        <rect x="363" y="155" width="12" height="30" rx="3" fill="#e07b2a" />
        <circle cx="220" cy="120" r="28" fill="#2a2a4a" stroke="#c0c0c0" strokeWidth="1.5" />
        <circle cx="220" cy="120" r="10" fill="#c0c0c0" opacity={0.6} />
        <rect x="208" y="93" width="24" height="8" rx="2" fill="#c0c0c0" opacity={0.7} />
        <rect x="208" y="119" width="24" height="8" rx="2" fill="#c0c0c0" opacity={0.7} />
        <rect x="193" y="108" width="8" height="24" rx="2" fill="#c0c0c0" opacity={0.7} />
        <rect x="219" y="108" width="8" height="24" rx="2" fill="#c0c0c0" opacity={0.7} />
        <circle cx="460" cy="220" r="32" fill="#2a2a4a" stroke="#c0c0c0" strokeWidth="1.5" />
        <circle cx="460" cy="220" r="12" fill="#c0c0c0" opacity={0.6} />
        <rect x="448" y="190" width="24" height="8" rx="2" fill="#c0c0c0" opacity={0.7} />
        <rect x="448" y="222" width="24" height="8" rx="2" fill="#c0c0c0" opacity={0.7} />
        <rect x="429" y="208" width="8" height="24" rx="2" fill="#c0c0c0" opacity={0.7} />
        <rect x="457" y="208" width="8" height="24" rx="2" fill="#c0c0c0" opacity={0.7} />
        <line x1="160" y1="60" x2="580" y2="60" stroke="#e07b2a" strokeWidth="0.5" opacity={0.2} />
        <line x1="160" y1="100" x2="580" y2="100" stroke="#e07b2a" strokeWidth="0.5" opacity={0.2} />
        <line x1="200" y1="20" x2="200" y2="280" stroke="#e07b2a" strokeWidth="0.5" opacity={0.2} />
        <line x1="480" y1="20" x2="480" y2="280" stroke="#e07b2a" strokeWidth="0.5" opacity={0.2} />
      </svg>
    ),
  },
  {
    id: "fuqarolik",
    label: "Fuqarolik",
    bg: "#0d1f12",
    svg: (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <polygon points="340,60 160,280 520,280" fill="none" stroke="#4caf82" strokeWidth="2.5" />
        <polygon points="340,100 195,260 485,260" fill="none" stroke="#4caf82" strokeWidth="1" opacity={0.4} />
        <line x1="340" y1="60" x2="340" y2="280" stroke="#4caf82" strokeWidth="1" opacity={0.5} />
        <line x1="160" y1="280" x2="520" y2="280" stroke="#4caf82" strokeWidth="2" />
        <rect x="290" y="200" width="100" height="80" fill="#1a3a22" stroke="#4caf82" strokeWidth="1.5" />
        <rect x="315" y="225" width="50" height="55" fill="none" stroke="#4caf82" strokeWidth="1" opacity={0.6} />
        <rect x="80" y="180" width="70" height="100" fill="#1a3a22" stroke="#4caf82" strokeWidth="1.5" />
        <rect x="560" y="200" width="60" height="80" fill="#1a3a22" stroke="#4caf82" strokeWidth="1.5" />
        <line x1="100" y1="180" x2="100" y2="100" stroke="#4caf82" strokeWidth="1" strokeDasharray="4 3" opacity={0.5} />
        <line x1="580" y1="200" x2="580" y2="120" stroke="#4caf82" strokeWidth="1" strokeDasharray="4 3" opacity={0.5} />
        <line x1="60" y1="280" x2="620" y2="280" stroke="#4caf82" strokeWidth="3" opacity={0.6} />
      </svg>
    ),
  },
  {
    id: "elektrotexnika",
    label: "Elektrotexnika",
    bg: "#0d1a2a",
    svg: (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <polygon points="340,80 290,190 330,190 270,290 390,160 345,160" fill="#f5c518" opacity={0.85} />
        <circle cx="340" cy="185" r="120" fill="none" stroke="#f5c518" strokeWidth="1" opacity={0.2} strokeDasharray="6 6" />
        <circle cx="340" cy="185" r="80" fill="none" stroke="#f5c518" strokeWidth="0.8" opacity={0.3} />
        <line x1="100" y1="185" x2="220" y2="185" stroke="#f5c518" strokeWidth="1.5" opacity={0.4} />
        <line x1="460" y1="185" x2="580" y2="185" stroke="#f5c518" strokeWidth="1.5" opacity={0.4} />
        <circle cx="140" cy="145" r="6" fill="#f5c518" opacity={0.5} />
        <circle cx="540" cy="150" r="6" fill="#f5c518" opacity={0.5} />
      </svg>
    ),
  },
  {
    id: "dasturiy",
    label: "Dasturiy ta'minot",
    bg: "#0e0e1a",
    svg: (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect x="160" y="70" width="360" height="220" rx="8" fill="#141428" stroke="#7c6ee0" strokeWidth="1.5" />
        <rect x="160" y="70" width="360" height="28" rx="8" fill="#1e1e40" />
        <circle cx="180" cy="84" r="5" fill="#e05555" />
        <circle cx="198" cy="84" r="5" fill="#e0c055" />
        <circle cx="216" cy="84" r="5" fill="#55e070" />
        <text x="178" y="118" fill="#7c6ee0" fontSize="13" fontFamily="monospace">&lt;muhandis</text>
        <text x="178" y="138" fill="#55e070" fontSize="13" fontFamily="monospace">{"  platform="}</text>
        <text x="178" y="158" fill="#e0c055" fontSize="13" fontFamily="monospace">{"  \"engineering\""}</text>
        <text x="178" y="178" fill="#7c6ee0" fontSize="13" fontFamily="monospace">/&gt;</text>
        <text x="178" y="210" fill="#aaaacc" fontSize="13" fontFamily="monospace">const future = build(</text>
        <text x="178" y="230" fill="#55e0c0" fontSize="13" fontFamily="monospace">{"  uzbekistan"}</text>
        <text x="178" y="250" fill="#aaaacc" fontSize="13" fontFamily="monospace">);</text>
        <rect x="178" y="260" width="2" height="16" fill="#7c6ee0" />
      </svg>
    ),
  },
  {
    id: "kimyo",
    label: "Kimyo",
    bg: "#0e1a12",
    svg: (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="340" cy="160" r="28" fill="#1a4a2a" stroke="#3dd68c" strokeWidth="2" />
        <text x="340" y="165" textAnchor="middle" fill="#3dd68c" fontSize="13" fontFamily="monospace">H₂O</text>
        <circle cx="220" cy="110" r="22" fill="#1a4a2a" stroke="#3dd68c" strokeWidth="1.5" />
        <text x="220" y="115" textAnchor="middle" fill="#3dd68c" fontSize="12" fontFamily="monospace">CO₂</text>
        <circle cx="460" cy="100" r="22" fill="#1a4a2a" stroke="#3dd68c" strokeWidth="1.5" />
        <text x="460" y="105" textAnchor="middle" fill="#3dd68c" fontSize="12" fontFamily="monospace">O₂</text>
        <circle cx="200" cy="230" r="22" fill="#1a4a2a" stroke="#3dd68c" strokeWidth="1.5" />
        <text x="200" y="235" textAnchor="middle" fill="#3dd68c" fontSize="11" fontFamily="monospace">NaCl</text>
        <circle cx="470" cy="235" r="22" fill="#1a4a2a" stroke="#3dd68c" strokeWidth="1.5" />
        <text x="470" y="240" textAnchor="middle" fill="#3dd68c" fontSize="11" fontFamily="monospace">CH₄</text>
        <line x1="312" y1="150" x2="242" y2="118" stroke="#3dd68c" strokeWidth="1" opacity={0.5} />
        <line x1="368" y1="150" x2="438" y2="108" stroke="#3dd68c" strokeWidth="1" opacity={0.5} />
        <line x1="325" y1="182" x2="218" y2="222" stroke="#3dd68c" strokeWidth="1" opacity={0.5} />
        <line x1="358" y1="180" x2="450" y2="225" stroke="#3dd68c" strokeWidth="1" opacity={0.5} />
        <circle cx="340" cy="160" r="70" fill="none" stroke="#3dd68c" strokeWidth="0.5" opacity={0.2} strokeDasharray="5 5" />
        <circle cx="340" cy="160" r="120" fill="none" stroke="#3dd68c" strokeWidth="0.5" opacity={0.15} strokeDasharray="3 7" />
      </svg>
    ),
  },
  {
    id: "kosmik",
    label: "Kosmik sanoat",
    bg: "#06060f",
    svg: (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="120" cy="80" r="2" fill="white" opacity={0.8} />
        <circle cx="200" cy="40" r="1.5" fill="white" opacity={0.6} />
        <circle cx="560" cy="60" r="2" fill="white" opacity={0.7} />
        <circle cx="600" cy="120" r="1.5" fill="white" opacity={0.5} />
        <circle cx="80" cy="200" r="1" fill="white" opacity={0.6} />
        <circle cx="620" cy="250" r="1.5" fill="white" opacity={0.5} />
        <circle cx="440" cy="30" r="1" fill="white" opacity={0.7} />
        <polygon points="340,80 300,220 340,200 380,220" fill="#c0c8e0" stroke="#a0aac8" strokeWidth="1" />
        <polygon points="340,140 250,200 260,215 340,180" fill="#9099b0" opacity={0.9} />
        <polygon points="340,140 430,200 420,215 340,180" fill="#9099b0" opacity={0.9} />
        <polygon points="340,195 330,220 350,220" fill="#ff7043" opacity={0.9} />
        <ellipse cx="340" cy="130" rx="12" ry="8" fill="#7090c0" />
        <circle cx="550" cy="160" r="35" fill="#1a2040" stroke="#3050a0" strokeWidth="1.5" />
        <circle cx="550" cy="160" r="20" fill="none" stroke="#3050a0" strokeWidth="1" strokeDasharray="4 3" />
        <circle cx="550" cy="160" r="8" fill="#3050a0" />
        <ellipse cx="550" cy="160" rx="40" ry="12" fill="none" stroke="#4060b0" strokeWidth="1" opacity={0.5} />
      </svg>
    ),
  },
  {
    id: "atrofmuhit",
    label: "Atrof-muhit",
    bg: "#071a0e",
    svg: (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="340" cy="200" rx="200" ry="80" fill="#0a2a14" stroke="#2ea855" strokeWidth="1.5" />
        <path d="M340,80 Q380,120 370,170 Q410,130 440,150 Q400,90 380,80 Q360,70 340,80Z" fill="#2ea855" opacity={0.8} />
        <path d="M340,80 Q300,120 310,170 Q270,130 240,150 Q280,90 300,80 Q320,70 340,80Z" fill="#2ea855" opacity={0.7} />
        <path d="M340,80 Q345,130 340,175" stroke="#1a6630" strokeWidth="2" fill="none" />
        <circle cx="200" cy="100" r="20" fill="#1a3a22" stroke="#2ea855" strokeWidth="1" />
        <path d="M200,80 Q210,65 200,55 Q190,65 200,80Z" fill="#2ea855" />
        <circle cx="460" cy="120" r="18" fill="#1a3a22" stroke="#2ea855" strokeWidth="1" />
        <path d="M460,102 Q470,88 460,78 Q450,88 460,102Z" fill="#2ea855" />
        <line x1="340" y1="175" x2="340" y2="280" stroke="#1a6630" strokeWidth="3" />
        <ellipse cx="340" cy="280" rx="40" ry="8" fill="#1a3a22" stroke="#2ea855" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "motosport",
    label: "Motosport",
    bg: "#0e0a04",
    svg: (
      <svg viewBox="0 0 680 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <path d="M120,210 L200,175 L280,185 L340,170 L420,180 L500,170 L560,210" stroke="#e07b2a" strokeWidth="2.5" fill="none" />
        <rect x="200" y="175" width="280" height="55" rx="12" fill="#1a1004" stroke="#e07b2a" strokeWidth="1.5" />
        <rect x="220" y="183" width="240" height="20" rx="4" fill="#2a1808" />
        <ellipse cx="240" cy="235" rx="30" ry="30" fill="#1a1004" stroke="#e07b2a" strokeWidth="2.5" />
        <ellipse cx="240" cy="235" rx="16" ry="16" fill="#2a1808" stroke="#e07b2a" strokeWidth="1.5" />
        <circle cx="240" cy="235" r="5" fill="#e07b2a" />
        <ellipse cx="460" cy="235" rx="30" ry="30" fill="#1a1004" stroke="#e07b2a" strokeWidth="2.5" />
        <ellipse cx="460" cy="235" rx="16" ry="16" fill="#2a1808" stroke="#e07b2a" strokeWidth="1.5" />
        <circle cx="460" cy="235" r="5" fill="#e07b2a" />
        <polygon points="430,175 460,145 490,175" fill="#cc3333" opacity={0.8} />
        <rect x="260" y="155" width="80" height="22" rx="4" fill="#cc3333" opacity={0.7} />
        <line x1="80" y1="230" x2="600" y2="230" stroke="#555" strokeWidth="2" />
        <line x1="100" y1="225" x2="580" y2="225" stroke="#e07b2a" strokeWidth="0.5" opacity={0.3} strokeDasharray="20 10" />
      </svg>
    ),
  },
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
     style={{ backgroundColor: dept.bg }}
    >
      {departments.map((d, i) => (
        <div
          key={d.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {d.svg}
        </div>
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 px-10 pb-10 text-white">
        <p
          className="text-xs font-medium tracking-widest uppercase mb-2"
          style={{ color: "rgba(255,255,255,0.65)" }}
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

      <div className="absolute bottom-4 right-6 flex gap-2">
        {departments.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.35)",
              transform: i === current ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      <div
        className="absolute bottom-0 left-0 h-[3px] transition-all duration-1000 linear"
        style={{
          width: `${progress}%`,
          backgroundColor: "#e07b2a",
        }}
      />
    </div>
  );
}
