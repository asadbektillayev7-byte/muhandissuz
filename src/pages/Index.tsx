import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedArticle from "@/components/FeaturedArticle";
import ArticleCard from "@/components/ArticleCard";
import CategoriesSection from "@/components/CategoriesSection";
import PopularArticles from "@/components/PopularArticles";
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
          <h2 className="text-3xl font-bold text-foreground mb-8">So'nggi maqolalar</h2>
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading && Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
              {articles?.slice(0, 9).map((article: any, i: number) => (
                <Link key={article.id} to={`/article/${article.slug}`}>
                  <div className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <ArticleCard
                      title={article.title}
                      excerpt={article.excerpt || ""}
                      image={article.featured_image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80"}
                      category={article.categories?.name || ""}
                      categoryColor={article.categories?.color || "#0066CC"}
                      date={article.publish_date ? new Date(article.publish_date).toLocaleDateString() : ""}
                      readTime="5 min"
                    />
                  </div>
                </Link>
              ))}
              {!isLoading && articles?.length === 0 && (
                <p className="text-muted-foreground col-span-3 text-center py-10">No articles published yet.</p>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <PopularArticles />
              </div>
            </div>
          </div>
        </section>

        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
