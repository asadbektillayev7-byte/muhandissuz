import {
  Cpu, Cog, Brain, FlaskConical, Car, Rocket,
  Code, Building, TreePine, BookOpen
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  { nameKey: "cat.elektro", icon: Cpu, count: 24, color: "hsl(195 100% 42%)" },
  { nameKey: "cat.mexanika", icon: Cog, count: 18, color: "hsl(210 6% 45%)" },
  { nameKey: "cat.ai", icon: Brain, count: 31, color: "hsl(271 73% 59%)" },
  { nameKey: "cat.kimyo", icon: FlaskConical, count: 12, color: "hsl(157 100% 50%)" },
  { nameKey: "cat.motosport", icon: Car, count: 9, color: "hsl(11 97% 50%)" },
  { nameKey: "cat.kosmik", icon: Rocket, count: 15, color: "hsl(220 95% 19%)" },
  { nameKey: "cat.dasturiy", icon: Code, count: 27, color: "hsl(210 100% 40%)" },
  { nameKey: "cat.fuqarolik", icon: Building, count: 20, color: "hsl(36 100% 50%)" },
  { nameKey: "cat.atrof", icon: TreePine, count: 11, color: "hsl(142 71% 45%)" },
  { nameKey: "cat.umumiy", icon: BookOpen, count: 33, color: "hsl(215 16% 47%)" },
];

const CategoriesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-foreground mb-3">{t("section.categories")}</h2>
        <p className="text-muted-foreground font-content max-w-md mx-auto">{t("section.categories_subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div key={cat.nameKey} className="group flex flex-col items-center gap-3 p-5 bg-card rounded-xl border border-border hover-lift cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${cat.color}15` }}>
              <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-card-foreground block">{t(cat.nameKey)}</span>
              <span className="text-xs text-muted-foreground">{cat.count} {t("article.articles")}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
