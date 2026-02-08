import { TrendingUp } from "lucide-react";

const popularArticles = [
  {
    title: "Python dasturlash tilining muhandislikdagi ahamiyati",
    category: "Dasturiy ta'minot",
    views: "2.4K",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&q=60",
  },
  {
    title: "Elektr mashinalari: asinxron dvigatellar ishlash prinsipi",
    category: "Elektrotexnika",
    views: "1.8K",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=60",
  },
  {
    title: "Formula 1 aerodinamikasi: DRS tizimi qanday ishlaydi?",
    category: "Motosport",
    views: "1.5K",
    image: "https://images.unsplash.com/photo-1504707748692-419802cf939d?w=200&q=60",
  },
  {
    title: "Yashil energiya: quyosh panellarining samaradorligi",
    category: "Atrof-muhit",
    views: "1.2K",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&q=60",
  },
];

const PopularArticles = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-secondary" />
        <h3 className="font-bold text-card-foreground">Eng ko'p ko'rilgan</h3>
      </div>
      <div className="space-y-4">
        {popularArticles.map((article, i) => (
          <div key={i} className="flex gap-3 group cursor-pointer">
            <img
              src={article.image}
              alt={article.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0"
              loading="lazy"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{article.category}</span>
                <span className="text-border">•</span>
                <span>{article.views} ko'rish</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularArticles;
