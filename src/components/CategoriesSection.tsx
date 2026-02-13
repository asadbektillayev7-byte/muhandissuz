import { Link } from "react-router-dom";
import {
  Cpu, Cog, Brain, FlaskConical, Car, Rocket,
  Code, Building, TreePine, BookOpen, LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  elektrotexnika: Cpu,
  mexanika: Cog,
  "suniy-intellekt": Brain,
  kimyo: FlaskConical,
  motosport: Car,
  "kosmik-sanoat": Rocket,
  "dasturiy-taminot": Code,
  fuqarolik: Building,
  "atrof-muhit": TreePine,
  umumiy: BookOpen,
};

const CategoriesSection = () => {
  const { t, lang } = useLanguage();
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-foreground mb-3">{t("section.categories")}</h2>
        <p className="text-muted-foreground font-content max-w-md mx-auto">{t("section.categories_subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading && Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        {categories?.map((cat) => {
          const Icon = iconMap[cat.slug] || BookOpen;
          const color = cat.color || "#0066CC";
          return (
            <Link
              key={cat.id}
              to={`/maqolalar/${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 bg-card rounded-xl border border-border hover-lift cursor-pointer transition-all"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-card-foreground block">
                  {lang === "en" ? (cat.name_en || cat.name) : cat.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesSection;
