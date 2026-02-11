import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublishedArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";

const PopularArticles = () => {
  const { t } = useLanguage();
  const { data: articles, isLoading } = usePublishedArticles();

  // Sort by views and take top 4
  const popular = articles
    ?.slice()
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 4) ?? [];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-secondary" />
        <h3 className="font-bold text-card-foreground">{t("section.popular")}</h3>
      </div>
      <div className="space-y-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        {popular.map((article: any) => (
          <Link key={article.id} to={`/article/${article.slug}`} className="flex gap-3 group">
            <img
              src={article.featured_image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=60"}
              alt={article.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0"
              loading="lazy"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{article.categories?.name || ""}</span>
                <span className="text-border">•</span>
                <span>{(article.views_count || 0).toLocaleString()}</span>
              </div>
            </div>
          </Link>
        ))}
        {!isLoading && popular.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">No articles yet</p>
        )}
      </div>
    </div>
  );
};

export default PopularArticles;
