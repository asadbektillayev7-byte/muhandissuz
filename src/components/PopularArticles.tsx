import { Link } from "react-router-dom";
import { usePublishedArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";

const PopularArticles = () => {
  const { data: articles, isLoading } = usePublishedArticles();

  const popular = articles
    ?.slice()
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 4) ?? [];

  return (
    <div className="border border-border p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary block mb-4">
        Trending
      </span>
      <div className="space-y-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        {popular.map((article: any) => (
          <Link key={article.id} to={`/article/${article.slug}`} className="flex gap-3 group">
            <img
              src={article.featured_image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=60"}
              alt={article.title}
              className="w-14 h-14 object-cover shrink-0 border border-border"
              loading="lazy"
            />
            <div className="min-w-0">
              <h4 className="font-display text-sm text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                {article.categories?.name || ""}
              </span>
            </div>
          </Link>
        ))}
        {!isLoading && popular.length === 0 && (
          <p className="text-sm text-muted-foreground text-center font-mono">No articles yet</p>
        )}
      </div>
    </div>
  );
};

export default PopularArticles;
