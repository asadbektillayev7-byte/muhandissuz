import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "uz" | "en";

const translations: Record<string, Record<Lang, string>> = {
  // Header
  "nav.home": { uz: "Bosh Sahifa", en: "Home" },
  "nav.directions": { uz: "Maqolalar", en: "Articles" },
  "nav.scientific": { uz: "Ilmiy Maqolalar", en: "Scientific Articles" },
  "nav.media": { uz: "OAV burchagi", en: "Media Corner" },
  "nav.team": { uz: "Jamoa", en: "Team" },
  "nav.about": { uz: "Loyiha haqida", en: "About Project" },
  "nav.donate": { uz: "Donat qilish", en: "Donate" },
  "nav.search": { uz: "Qidirish...", en: "Search..." },

  // Hero
  "hero.title": { uz: "O'zbekistonda muhandislik kelajagini quramiz", en: "Building the future of engineering in Uzbekistan" },
  "hero.subtitle": { uz: "Muhandislik sohasidagi eng so'nggi yangiliklar, ilmiy maqolalar va ta'lim resurslari", en: "Latest news, scientific articles and educational resources in engineering" },
  "hero.cta": { uz: "Ko'proq bilish", en: "Learn More" },

  // Sections
  "section.latest": { uz: "So'nggi maqolalar", en: "Latest Articles" },
  "section.popular": { uz: "Eng ko'p ko'rilgan", en: "Most Viewed" },
  "section.categories": { uz: "Maqolalar", en: "Articles" },
  "section.categories_subtitle": { uz: "Muhandislikning turli sohalarini o'rganing", en: "Explore various fields of engineering" },
  "article.readmore": { uz: "Davomini o'qish", en: "Continue Reading" },
  "article.readtime": { uz: "daqiqa", en: "min" },
  "article.articles": { uz: "maqola", en: "articles" },

  // Footer
  "footer.description": { uz: "O'zbekistonda muhandislik ta'limini rivojlantirish va yosh muhandislarni qo'llab-quvvatlash platformasi.", en: "A platform for developing engineering education and supporting young engineers in Uzbekistan." },
  "footer.quicklinks": { uz: "Tezkor havolalar", en: "Quick Links" },
  "footer.contact": { uz: "Biz bilan aloqa", en: "Contact Us" },
  "footer.terms": { uz: "Xizmat ko'rsatish shartlari", en: "Terms of Service" },
  "footer.aboutus": { uz: "Biz haqimizda", en: "About Us" },
  "footer.social": { uz: "Ijtimoiy tarmoqlar", en: "Social Media" },
  "footer.newsletter": { uz: "Yangiliklar", en: "Newsletter" },
  "footer.newsletter_desc": { uz: "Eng so'nggi yangiliklarni birinchi bo'lib oling", en: "Be the first to get the latest news" },
  "footer.subscribe": { uz: "Obuna bo'lish", en: "Subscribe" },
  "footer.email_placeholder": { uz: "Email manzilingiz", en: "Your email" },
  "footer.copyright": { uz: "Barcha huquqlar himoyalangan.", en: "All rights reserved." },
  "footer.privacy": { uz: "Maxfiylik siyosati", en: "Privacy Policy" },

  // Featured
  "featured.tag": { uz: "Tavsiya etilgan", en: "Featured" },

  // Admin
  "admin.dashboard": { uz: "Dashboard", en: "Dashboard" },
  "admin.articles": { uz: "Maqolalar", en: "Articles" },
  "admin.categories": { uz: "Kategoriyalar", en: "Categories" },
  "admin.team": { uz: "Jamoa", en: "Team" },
  "admin.media_library": { uz: "Media kutubxonasi", en: "Media Library" },
  "admin.scientific": { uz: "Ilmiy maqolalar", en: "Scientific Articles" },
  "admin.media_corner": { uz: "OAV burchagi", en: "Media Corner" },
  "admin.users": { uz: "Foydalanuvchilar", en: "Users" },
  "admin.comments": { uz: "Izohlar", en: "Comments" },
  "admin.analytics": { uz: "Analitika", en: "Analytics" },
  "admin.settings": { uz: "Sozlamalar", en: "Settings" },
  "admin.logout": { uz: "Chiqish", en: "Log Out" },
  "admin.viewsite": { uz: "Saytni ko'rish", en: "View Site" },
  "admin.search": { uz: "Qidirish...", en: "Search..." },
  "admin.profile": { uz: "Profil", en: "Profile" },
  "admin.new_article": { uz: "Yangi maqola", en: "New Article" },
  "admin.save": { uz: "Saqlash", en: "Save" },
  "admin.cancel": { uz: "Bekor qilish", en: "Cancel" },
  "admin.delete": { uz: "O'chirish", en: "Delete" },
  "admin.edit": { uz: "Tahrirlash", en: "Edit" },
  "admin.view": { uz: "Ko'rish", en: "View" },
  "admin.upload": { uz: "Yuklash", en: "Upload" },
  "admin.login_title": { uz: "Muhandiss.uz Admin", en: "Muhandiss.uz Admin" },
  "admin.login_subtitle": { uz: "Boshqaruv paneliga kirish", en: "Login to admin panel" },
  "admin.login_button": { uz: "Kirish", en: "Sign In" },
  "admin.password": { uz: "Parol", en: "Password" },
  "admin.remember": { uz: "Meni eslab qol", en: "Remember me" },
  "admin.forgot": { uz: "Parolni unutdingizmi?", en: "Forgot password?" },
  "admin.signup": { uz: "Ro'yxatdan o'tish", en: "Sign Up" },
  "admin.signup_subtitle": { uz: "Yangi hisob yaratish", en: "Create a new account" },
  "admin.fullname": { uz: "To'liq ism", en: "Full Name" },
  "admin.have_account": { uz: "Hisobingiz bormi?", en: "Already have an account?" },
  "admin.no_account": { uz: "Hisobingiz yo'qmi?", en: "Don't have an account?" },
  "admin.confirm_email": { uz: "Emailingizni tasdiqlang", en: "Please confirm your email" },
  "admin.check_email": { uz: "Email manzilingizga tasdiqlash havolasi yuborildi.", en: "A confirmation link has been sent to your email." },
  
  // Dashboard stats
  "stats.total_articles": { uz: "Jami maqolalar", en: "Total Articles" },
  "stats.total_views": { uz: "Jami ko'rishlar", en: "Total Views" },
  "stats.new_comments": { uz: "Yangi izohlar", en: "New Comments" },
  "stats.active_users": { uz: "Faol foydalanuvchilar", en: "Active Users" },
  "stats.views_chart": { uz: "Ko'rishlar statistikasi", en: "Views Statistics" },
  "stats.category_dist": { uz: "Kategoriya taqsimoti", en: "Category Distribution" },
  "stats.recent_articles": { uz: "So'nggi maqolalar", en: "Recent Articles" },
  "stats.recent_activity": { uz: "So'nggi faoliyat", en: "Recent Activity" },
  "stats.quick_actions": { uz: "Tezkor harakatlar", en: "Quick Actions" },
  "stats.write_article": { uz: "Maqola yozish", en: "Write Article" },
  "stats.upload_media": { uz: "Media yuklash", en: "Upload Media" },
  "stats.analytics": { uz: "Analitika", en: "Analytics" },
  "stats.all": { uz: "Barchasi", en: "All" },
  "stats.published": { uz: "Chop etilgan", en: "Published" },
  "stats.draft": { uz: "Qoralama", en: "Draft" },
  "stats.scheduled": { uz: "Rejalashtirilgan", en: "Scheduled" },
  "stats.panel_desc": { uz: "Muhandiss.uz boshqaruv paneli", en: "Muhandiss.uz control panel" },

  // Categories
  "cat.atrof": { uz: "Atrof-muhit", en: "Environment" },
  "cat.dasturiy": { uz: "Dasturiy ta'minot", en: "Software" },
  "cat.elektro": { uz: "Elektrotexnika", en: "Electrical Engineering" },
  "cat.fuqarolik": { uz: "Fuqarolik", en: "Civil Engineering" },
  "cat.kimyo": { uz: "Kimyo", en: "Chemistry" },
  "cat.kosmik": { uz: "Kosmik sanoat", en: "Aerospace" },
  "cat.mexanika": { uz: "Mexanika", en: "Mechanical Engineering" },
  "cat.motosport": { uz: "Motosport", en: "Motorsport" },
  "cat.ai": { uz: "Sun'iy Intellekt", en: "Artificial Intelligence" },
  "cat.umumiy": { uz: "Umumiy", en: "General" },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Lang) || "uz";
    }
    return "uz";
  });

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    document.documentElement.lang = newLang;
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
