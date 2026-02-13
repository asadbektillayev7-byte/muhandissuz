import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublishedArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { Calendar, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ScientificArticlesPage = () => {
  const { lang } = useLanguage();
  const { data: articles, isLoading } = usePublishedArticles();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = articles?.filter((a: any) => {
    const matchesSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || a.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-muted border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {lang === "uz" ? "Ilmiy Maqolalar" : "Scientific Articles"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "uz"
                ? "Muhandislik sohasidagi eng so'nggi ilmiy maqolalar"
                : "Latest scientific articles in engineering"}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={lang === "uz" ? "Maqola qidirish..." : "Search articles..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={lang === "uz" ? "Kategoriya" : "Category"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "uz" ? "Barchasi" : "All"}</SelectItem>
                {categories?.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {lang === "en" && cat.name_en ? cat.name_en : cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && filtered?.length === 0 && (
            <p className="text-center text-muted-foreground py-16">
              {lang === "uz" ? "Maqolalar topilmadi" : "No articles found"}
            </p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((article: any) => (
              <Link key={article.id} to={`/article/${article.slug}`}>
                <article className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.featured_image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80"}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {article.categories?.name && (
                      <span
                        className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full text-primary-foreground"
                        style={{ backgroundColor: article.categories?.color || "hsl(var(--primary))" }}
                      >
                        {lang === "en" && article.categories?.name_en ? article.categories.name_en : article.categories.name}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{article.publish_date ? new Date(article.publish_date).toLocaleDateString() : ""}</span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {lang === "en" && article.title_en ? article.title_en : article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lang === "en" && article.excerpt_en ? article.excerpt_en : article.excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ScientificArticlesPage;
