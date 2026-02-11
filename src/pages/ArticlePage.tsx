import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useArticleBySlug } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const ArticlePage = () => {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const { data: article, isLoading } = useArticleBySlug(slug || "");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : article ? (
          <article>
            <Button variant="ghost" size="sm" className="mb-4" asChild>
              <Link to={article.categories ? `/category/${(article as any).categories.slug}` : "/"}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Link>
            </Button>

            {(article as any).categories && (
              <span
                className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-primary-foreground mb-4"
                style={{ backgroundColor: (article as any).categories.color || "#0066CC" }}
              >
                {(article as any).categories.name}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {lang === "en" ? (article.title_en || article.title) : article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              {article.publish_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.publish_date).toLocaleDateString()}
                </div>
              )}
              {article.views_count !== null && (
                <span>{article.views_count} views</span>
              )}
            </div>

            {article.featured_image && (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
              />
            )}

            {article.excerpt && (
              <p className="text-lg text-muted-foreground mb-8 font-content leading-relaxed">
                {lang === "en" ? (article.excerpt_en || article.excerpt) : article.excerpt}
              </p>
            )}

            <div
              className="prose prose-lg dark:prose-invert max-w-none font-content"
              dangerouslySetInnerHTML={{
                __html: lang === "en" ? (article.content_en || article.content || "") : (article.content || ""),
              }}
            />

            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-8 pt-6 border-t border-border">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {article.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}
          </article>
        ) : (
          <p className="text-muted-foreground text-center py-10">Article not found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;
