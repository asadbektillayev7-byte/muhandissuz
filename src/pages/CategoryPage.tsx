import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { useCategoryBySlug } from "@/hooks/useCategories";
import { usePublishedArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

const CategoryPage = () => {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const { data: category, isLoading: loadingCat } = useCategoryBySlug(slug || "");
  const { data: articles, isLoading: loadingArticles } = usePublishedArticles(slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {loadingCat ? (
          <Skeleton className="h-10 w-64 mb-8" />
        ) : category ? (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {lang === "en" ? (category.name_en || category.name) : category.name}
            </h1>
            <p className="text-muted-foreground">
              {lang === "en" ? (category.description_en || category.description) : category.description}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">Category not found.</p>
        )}

        {loadingArticles ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Link key={article.id} to={`/article/${article.slug}`}>
                <ArticleCard
                  title={article.title}
                  excerpt={article.excerpt || ""}
                  image={article.featured_image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80"}
                  category={article.categories?.name || ""}
                  categoryColor={article.categories?.color || "#0066CC"}
                  date={article.publish_date ? new Date(article.publish_date).toLocaleDateString() : ""}
                  readTime="5 min"
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">No articles in this category yet.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
