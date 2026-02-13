import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Image, Video, FileText } from "lucide-react";

const typeIcons: Record<string, any> = {
  photo: Image,
  video: Video,
  article: FileText,
};

const MediaCornerPage = () => {
  const { lang } = useLanguage();

  const { data: items, isLoading } = useQuery({
    queryKey: ["media-corner-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_corner")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-muted border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {lang === "uz" ? "OAV burchagi" : "Media Corner"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "uz"
                ? "Matbuot materiallari, media xabarlari va foto/video galereyalar"
                : "Press materials, media mentions and photo/video galleries"}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && items?.length === 0 && (
            <p className="text-center text-muted-foreground py-16">
              {lang === "uz" ? "Hali materiallar qo'shilmagan" : "No media items added yet"}
            </p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items?.map((item) => {
              const Icon = typeIcons[item.type] || FileText;
              return (
                <a
                  key={item.id}
                  href={item.url || "#"}
                  target={item.url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-muted overflow-hidden">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="capitalize">{item.type}</span>
                      {item.event_date && (
                        <>
                          <span className="text-border">•</span>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(item.event_date).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {lang === "en" && item.title_en ? item.title_en : item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lang === "en" && item.description_en ? item.description_en : item.description}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MediaCornerPage;
