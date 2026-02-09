import { Link } from "react-router-dom";
import { Send, Youtube, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">Muhandis</span>
            </div>
            <p className="text-sm text-primary-foreground/60 font-content leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.quicklinks")}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">{t("nav.home")}</Link></li>
              <li><Link to="/haqida" className="hover:text-primary-foreground transition-colors">{t("footer.aboutus")}</Link></li>
              <li><Link to="/aloqa" className="hover:text-primary-foreground transition-colors">{t("footer.contact")}</Link></li>
              <li><Link to="/shartlar" className="hover:text-primary-foreground transition-colors">{t("footer.terms")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.social")}</h4>
            <div className="flex gap-3">
              {[
                { icon: Send, label: "Telegram" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map((s) => (
                <a key={s.label} href="#" aria-label={s.label} className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-primary-foreground/60 mt-4">
              Telegram: <a href="https://t.me/muhandis_department" className="text-accent hover:underline">@muhandis_department</a>
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.newsletter")}</h4>
            <p className="text-sm text-primary-foreground/60 mb-3 font-content">{t("footer.newsletter_desc")}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t("footer.email_placeholder")}
                className="flex-1 px-3 py-2 text-sm bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-primary-foreground/40 text-primary-foreground"
              />
              <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-primary-foreground/40">
          <span>© 2026 Muhandis. {t("footer.copyright")}</span>
          <Link to="/maxfiylik" className="hover:text-primary-foreground/60 transition-colors">{t("footer.privacy")}</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
