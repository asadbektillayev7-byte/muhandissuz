import {
  Cpu, Cog, Brain, FlaskConical, Car, Rocket,
  Code, Building, TreePine, BookOpen
} from "lucide-react";

const categories = [
  { name: "Elektrotexnika", icon: Cpu, count: 24, color: "hsl(195 100% 42%)" },
  { name: "Mexanika", icon: Cog, count: 18, color: "hsl(210 6% 45%)" },
  { name: "Sun'iy Intellekt", icon: Brain, count: 31, color: "hsl(271 73% 59%)" },
  { name: "Kimyo", icon: FlaskConical, count: 12, color: "hsl(157 100% 50%)" },
  { name: "Motosport", icon: Car, count: 9, color: "hsl(11 97% 50%)" },
  { name: "Kosmik sanoat", icon: Rocket, count: 15, color: "hsl(220 95% 19%)" },
  { name: "Dasturiy ta'minot", icon: Code, count: 27, color: "hsl(210 100% 40%)" },
  { name: "Fuqarolik muhandisligi", icon: Building, count: 20, color: "hsl(36 100% 50%)" },
  { name: "Atrof-muhit", icon: TreePine, count: 11, color: "hsl(142 71% 45%)" },
  { name: "Umumiy", icon: BookOpen, count: 33, color: "hsl(215 16% 47%)" },
];

const CategoriesSection = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-foreground mb-3">Yo'nalishlar</h2>
        <p className="text-muted-foreground font-content max-w-md mx-auto">
          Qiziqishingizga mos muhandislik yo'nalishini tanlang
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="group flex flex-col items-center gap-3 p-5 bg-card rounded-xl border border-border hover-lift cursor-pointer transition-all"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${cat.color}15` }}
            >
              <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-card-foreground block">
                {cat.name}
              </span>
              <span className="text-xs text-muted-foreground">{cat.count} maqola</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
