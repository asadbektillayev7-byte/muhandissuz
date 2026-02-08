import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeaturedArticle = () => {
  return (
    <section className="container mx-auto px-4 -mt-16 relative z-20">
      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-auto min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
              alt="Featured article"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-card" />
            <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold bg-category-ai text-primary-foreground rounded-full">
              Sun'iy Intellekt
            </span>
          </div>
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="w-4 h-4" />
              <span>8 Fevral, 2026</span>
              <span className="text-border">•</span>
              <span>7 daqiqa o'qish</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4 leading-tight">
              Sun'iy intellektning muhandislik sohasidagi inqilobi: 2026 yil tendensiyalari
            </h2>
            <p className="text-muted-foreground font-content leading-relaxed mb-6">
              Sun'iy intellekt texnologiyalari muhandislik sohasini tubdan o'zgartirmoqda. 
              Avtomatlashtirilgan loyihalash, prediktiv texnik xizmat va aqlli ishlab chiqarish 
              jarayonlari haqida batafsil...
            </p>
            <Button className="self-start gap-2 bg-primary hover:bg-primary/90">
              Davomini o'qish
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticle;
