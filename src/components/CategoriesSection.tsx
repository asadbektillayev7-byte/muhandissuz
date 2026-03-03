import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useLanguage } from "@/contexts/LanguageContext";

const placeholderCategories = [
  { name: "Structures", slug: "structures" },
  { name: "Energy", slug: "energy" },
  { name: "Software", slug: "software" },
  { name: "Space", slug: "space" },
  { name: "Materials", slug: "materials" },
  { name: "Infrastructure", slug: "infrastructure" },
];

const CategoriesSection = () => {
  const { data: dbCategories } = useCategories();
  const { lang } = useLanguage();

  const categories = dbCategories && dbCategories.length > 0
    ? dbCategories.map((c) => ({ name: lang === "en" ? (c.name_en || c.name) : c.name, slug: c.slug }))
    : placeholderCategories;

  return (
    <section id="categories" className="border-y border-border py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Categories</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/maqolalar/${cat.slug}`}
              className="group border border-border p-6 text-center brutalist-hover"
            >
              <span className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
