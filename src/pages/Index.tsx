import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedArticle from "@/components/FeaturedArticle";
import ArticleCard from "@/components/ArticleCard";
import CategoriesSection from "@/components/CategoriesSection";
import PopularArticles from "@/components/PopularArticles";
import Footer from "@/components/Footer";

const articles = [
  {
    title: "Kvant kompyuterlari: muhandislik uchun yangi imkoniyatlar",
    excerpt: "Kvant hisoblash texnologiyalari muhandislik sohasida qanday inqilob yaratishi mumkin?",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    category: "Elektrotexnika",
    categoryColor: "hsl(195, 100%, 42%)",
    date: "6 Fevral, 2026",
    readTime: "5 daqiqa",
  },
  {
    title: "3D bosma texnologiyasi: aviatsiya qismlarini ishlab chiqarish",
    excerpt: "Additive manufacturing texnologiyalari aviatsiya sanoatini qanday o'zgartirmoqda.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80",
    category: "Kosmik sanoat",
    categoryColor: "hsl(220, 95%, 19%)",
    date: "4 Fevral, 2026",
    readTime: "6 daqiqa",
  },
  {
    title: "Mexatronika: robotlarning harakat tizimlarini loyihalash",
    excerpt: "Zamonaviy robotlarning harakat mexanizmlarini loyihalash va boshqarish usullari.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    category: "Mexanika",
    categoryColor: "hsl(210, 6%, 45%)",
    date: "2 Fevral, 2026",
    readTime: "4 daqiqa",
  },
  {
    title: "Kimyoviy muhandislikda katalitik jarayonlar",
    excerpt: "Sanoat miqyosida katalitik reaktorlarning samaradorligini oshirish usullari.",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80",
    category: "Kimyo",
    categoryColor: "hsl(157, 100%, 50%)",
    date: "31 Yanvar, 2026",
    readTime: "8 daqiqa",
  },
  {
    title: "GPT modellarining texnik tahlili va arxitekturasi",
    excerpt: "Transformer arxitekturasi va katta til modellarining ishlash printsiplari.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    category: "Sun'iy Intellekt",
    categoryColor: "hsl(271, 73%, 59%)",
    date: "28 Yanvar, 2026",
    readTime: "10 daqiqa",
  },
  {
    title: "Formula 1 da energiya qayta tiklash tizimi (ERS)",
    excerpt: "Zamonaviy F1 avtomobillarida ishlatilgan gibrid quvvat tizimlari haqida.",
    image: "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=600&q=80",
    category: "Motosport",
    categoryColor: "hsl(11, 97%, 50%)",
    date: "25 Yanvar, 2026",
    readTime: "6 daqiqa",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturedArticle />

        {/* Latest Articles + Sidebar */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">So'nggi maqolalar</h2>
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((article, i) => (
                <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <ArticleCard {...article} />
                </div>
              ))}
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
