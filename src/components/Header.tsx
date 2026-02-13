import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, ChevronDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import ThemeLangToggle from "@/components/ThemeLangToggle";

const categories = [
  { nameKey: "cat.atrof", slug: "atrof-muhit" },
  { nameKey: "cat.dasturiy", slug: "dasturiy-taminot" },
  { nameKey: "cat.elektro", slug: "elektrotexnika" },
  { nameKey: "cat.fuqarolik", slug: "fuqarolik" },
  { nameKey: "cat.kimyo", slug: "kimyo" },
  { nameKey: "cat.kosmik", slug: "kosmik-sanoat" },
  { nameKey: "cat.mexanika", slug: "mexanika" },
  { nameKey: "cat.motosport", slug: "motosport" },
  { nameKey: "cat.ai", slug: "suniy-intellekt" },
  { nameKey: "cat.umumiy", slug: "umumiy" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav.scientific"), href: "/maqolalar" },
    { name: t("nav.media"), href: "/oav-burchagi" },
    { name: t("nav.team"), href: "/jamoa" },
    { name: t("nav.about"), href: "/loyiha-haqida" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-md border-b border-border"
          : "bg-card border-b border-border"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">Muhandis</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/" className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md">
            {t("nav.home")}
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md">
              {t("nav.directions")}
              <ChevronDown className="w-4 h-4" />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-lg shadow-xl p-2 animate-slide-down z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/maqolalar/${cat.slug}`}
                    className="block px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {t(cat.nameKey)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  placeholder={t("nav.search")}
                  className="w-48 px-3 py-1.5 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          <ThemeLangToggle />

          <Button size="sm" className="hidden sm:inline-flex gap-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Heart className="w-4 h-4" />
            {t("nav.donate")}
          </Button>

          <button className="lg:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-card border-t border-border animate-slide-down">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("nav.search")}
                className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>

            <Link to="/" className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md" onClick={() => setMobileOpen(false)}>
              {t("nav.home")}
            </Link>

            <div>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 w-full px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md"
              >
                {t("nav.directions")}
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="ml-4 space-y-1 mt-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/maqolalar/${cat.slug}`}
                      className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(cat.nameKey)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <Button size="sm" className="w-full mt-4 gap-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Heart className="w-4 h-4" />
              {t("nav.donate")}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
