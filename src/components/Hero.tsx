import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full h-[520px] md:h-[580px] overflow-hidden">
      <img src={heroBanner} alt="Muhandislik kelajagi" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 gradient-hero" />
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-16">
        <div className="max-w-2xl space-y-5 animate-fade-in-up">
          <div className="editorial-divider" />
          <span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.25em]">
            Muhandislik platformasi
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1]">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/75 font-content max-w-xl leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="flex gap-3 pt-2">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold rounded-md">
              {t("hero.cta")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
