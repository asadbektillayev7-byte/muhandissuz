import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedArticle from "@/components/FeaturedArticle";
import ArticleCard from "@/components/ArticleCard";
import CategoriesSection from "@/components/CategoriesSection";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import { usePublishedArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: articles, isLoading } = usePublishedArticles();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturedArticle />

        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-4 mb-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Latest
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72" />
              ))}
            {articles?.slice(0, 9).map((article: any, i: number) => (
              <div
                key={article.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <ArticleCard
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
              </div>
            ))}
            {!isLoading && articles?.length === 0 && (
              <p className="text-muted-foreground col-span-3 text-center py-10 font-mono text-sm">
                No articles published yet.
              </p>
            )}
          </div>
        </section>

        <Ticker text="Structures · Energy · Software · Space · Materials · Infrastructure · Built by Students" />

        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
