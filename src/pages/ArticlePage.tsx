import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useArticleBySlug, useIncrementViews } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

const ArticlePage = () => {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const { data: article, isLoading } = useArticleBySlug(slug || "");
  const incrementViews = useIncrementViews();

  useEffect(() => {
    if (article?.id) {
      const key = `viewed_${article.id}`;
      if (!sessionStorage.getItem(key)) {
        incrementViews.mutate(article.id);
        sessionStorage.setItem(key, "1");
      }
    }
  }, [article?.id]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        {isLoading ? (
          <div className="container mx-auto px-4 py-16 max-w-4xl space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : article ? (
          <>
            {/* Hero header */}
            <div className="border-b border-border">
              <div className="container mx-auto px-4 py-16 max-w-4xl">
                <Link
                  to="/"
                  className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors mb-8 inline-block"
                >
                  ← BACK
                </Link>

                {(article as any).categories && (
                  <span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-primary mb-4">
                    {(article as any).categories.name}
                  </span>
                )}

                <h1 className="font-display text-4xl md:text-6xl text-foreground leading-[0.95] mb-6">
                  {lang === "en" ? (article.title_en || article.title) : article.title}
                </h1>

                <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  {article.publish_date && (
                    <span>{new Date(article.publish_date).toLocaleDateString()}</span>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <>
                      <span className="text-border">·</span>
                      <span>{article.tags.join(", ")}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content area with sidebar */}
            <div className="container mx-auto px-4 py-12">
              <div className="grid lg:grid-cols-[1fr_280px] gap-12 max-w-5xl mx-auto">
                <div>
                  {article.featured_image && (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-64 md:h-96 object-cover mb-10 border border-border"
                    />
                  )}

                  {article.excerpt && (
                    <p className="font-body text-xl text-muted-foreground mb-10 leading-relaxed italic">
                      {lang === "en" ? (article.excerpt_en || article.excerpt) : article.excerpt}
                    </p>
                  )}

                  <div
                    className="prose-editorial"
                    dangerouslySetInnerHTML={{
                      __html: lang === "en" ? (article.content_en || article.content || "") : (article.content || ""),
                    }}
                  />
                </div>

                {/* Sidebar */}
                <aside className="hidden lg:block">
                  <div className="sticky top-20 space-y-8">
                    <div className="border border-border p-6">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-3">
                        Quick Stats
                      </span>
                      {[
                        { value: "43%", label: "bridges over 50yrs" },
                        { value: "$125B", label: "repair backlog" },
                      ].map((stat) => (
                        <div key={stat.label} className="mb-4">
                          <div className="font-display text-3xl text-primary">{stat.value}</div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {article.tags && article.tags.length > 0 && (
                      <div className="border border-border p-6">
                        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-3">
                          Tags
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground border border-border px-2 py-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4 py-20 text-center">
            <p className="text-muted-foreground font-mono text-sm">Article not found.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;
