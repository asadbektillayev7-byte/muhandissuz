import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  return (
    <section className="relative w-full h-[520px] md:h-[580px] overflow-hidden">
      <img
        src={heroBanner}
        alt="Muhandislik kelajagi"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 gradient-hero" />
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl space-y-6 animate-fade-in-up">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-secondary/90 text-secondary-foreground rounded-full uppercase tracking-wider">
            Muhandislik platformasi
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight">
            O'zbekistonda muhandislik kelajagini quramiz
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 font-content max-w-xl">
            Eng so'nggi muhandislik yangiliklari, ilmiy maqolalar va texnologik 
            innovatsiyalar — barchasi bir joyda.
          </p>
          <div className="flex gap-3">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2 font-semibold">
              Boshlash
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Ko'proq bilish
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
