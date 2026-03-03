import { Link } from "react-router-dom";
import { usePublishedArticles } from "@/hooks/useArticles";

const FeaturedArticle = () => {
  const { data: articles } = usePublishedArticles();
  const featured = articles?.[0];

  if (!featured) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-0 border border-border">
          <div className="h-80 md:h-auto bg-secondary" />
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary mb-4">
              Featured
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-foreground leading-tight mb-4">
              WHY CONCRETE CRACKS — AND WHO PAYS FOR IT
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              An investigation into deteriorating infrastructure across Central Asia, the engineering behind material fatigue, and the economic reality of deferred maintenance.
            </p>
            <span className="font-mono text-[11px] uppercase tracking-[2px] text-primary">
              READ ARTICLE →
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <Link to={`/article/${(featured as any).slug}`}>
        <div className="grid md:grid-cols-2 gap-0 border border-border brutalist-hover">
          <div className="h-80 md:h-auto overflow-hidden">
            <img
              src={(featured as any).featured_image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"}
              alt={(featured as any).title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary mb-4">
              Featured
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-card-foreground leading-tight mb-4">
              {(featured as any).title}
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              {(featured as any).excerpt || "Read the full article for more details."}
            </p>
            <span className="font-mono text-[11px] uppercase tracking-[2px] text-primary">
              READ ARTICLE →
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
};

export default FeaturedArticle;
