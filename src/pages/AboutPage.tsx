import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Target, Eye, Rocket } from "lucide-react";

const AboutPage = () => {
  const { lang } = useLanguage();

  const { data: settings } = useQuery({
    queryKey: ["site-settings", "about_page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "about_page")
        .maybeSingle();
      if (error) throw error;
      return data?.value as Record<string, any> | null;
    },
  });

  const mission = settings?.mission || (lang === "uz"
    ? "O'zbekistonda muhandislik ta'limini rivojlantirish va yosh muhandislarga sifatli ta'lim resurslarini taqdim etish."
    : "Developing engineering education in Uzbekistan and providing quality educational resources for young engineers.");

  const vision = settings?.vision || (lang === "uz"
    ? "O'zbekistonni Markaziy Osiyodagi muhandislik innovatsiyalari markaziga aylantirish."
    : "Transforming Uzbekistan into a center of engineering innovation in Central Asia.");

  const goals = settings?.goals || (lang === "uz"
    ? "Muhandislik sohasidagi ilmiy maqolalar, yangiliklar va ta'lim materiallarini bir joyga to'plash."
    : "Gathering scientific articles, news and educational materials in engineering in one place.");

  const sections = [
    { icon: Target, title: lang === "uz" ? "Missiya" : "Mission", text: mission },
    { icon: Eye, title: lang === "uz" ? "Viziya" : "Vision", text: vision },
    { icon: Rocket, title: lang === "uz" ? "Maqsadlar" : "Goals", text: goals },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-muted border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {lang === "uz" ? "Loyiha haqida" : "About the Project"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "uz"
                ? "Muhandis platformasi — O'zbekiston muhandislari uchun"
                : "Muhandis platform — for engineers of Uzbekistan"}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
