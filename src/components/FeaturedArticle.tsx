import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublishedArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedArticle = () => {
  const { t, lang } = useLanguage();
  const { data: articles, isLoading } = usePublishedArticles();

  // Use the first published article as featured
  const article = articles?.[0] as any;

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <Skeleton className="h-[300px] rounded-2xl" />
      </section>
    );
  }

  if (!article) return null;

  return (
    <section className="container mx-auto px-4 -mt-16 relative z-20">
      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-auto min-h-[300px]">
            <img
              src={article.featured_image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-card" />
            {article.categories && (
              <span
                className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold text-primary-foreground rounded-full"
                style={{ backgroundColor: article.categories.color || "#0066CC" }}
              >
                {article.categories.name}
              </span>
            )}
          </div>
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="w-4 h-4" />
              <span>{article.publish_date ? new Date(article.publish_date).toLocaleDateString() : ""}</span>
            </div>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
              {t("featured.tag")}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4 leading-tight">
              {lang === "en" ? (article.title_en || article.title) : article.title}
            </h2>
            <p className="text-muted-foreground font-content leading-relaxed mb-6 line-clamp-3">
              {lang === "en" ? (article.excerpt_en || article.excerpt) : article.excerpt}
            </p>
            <Button className="self-start gap-2 bg-primary hover:bg-primary/90" asChild>
              <Link to={`/article/${article.slug}`}>
                {t("article.readmore")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticle;
