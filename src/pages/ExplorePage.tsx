import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { usePublishedArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const ExplorePage = () => {
  const { data: articles, isLoading } = usePublishedArticles();
  const { data: categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? articles?.filter((a: any) => a.categories?.slug === activeCategory)
    : articles;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-16">
            <div className="editorial-divider mb-4" />
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4">EXPLORE</h1>
            <p className="font-body text-lg text-muted-foreground max-w-lg">
              Browse all published articles across engineering disciplines.
            </p>
          </div>
        </div>

        {/* Category filter strip */}
        <div className="border-b border-border overflow-x-auto">
          <div className="container mx-auto px-4 flex items-center gap-0">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] px-4 py-3 border-r border-border transition-colors ${
                !activeCategory ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] px-4 py-3 border-r border-border transition-colors ${
                  activeCategory === cat.slug ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading &&
              Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-72" />
              ))}
            {filtered?.map((article: any) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.excerpt || ""}
                image={
                  article.featured_image ||
                  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80"
                }
                category={article.categories?.name || ""}
                date={
                  article.publish_date
                    ? new Date(article.publish_date).toLocaleDateString()
                    : ""
                }
                readTime="5 min"
                slug={article.slug}
              />
            ))}
            {!isLoading && (!filtered || filtered.length === 0) && (
              <p className="text-muted-foreground col-span-3 text-center py-16 font-mono text-sm">
                No articles found.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExplorePage;
