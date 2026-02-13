import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Linkedin, Send, Instagram, Globe } from "lucide-react";

const socialIcons: Record<string, any> = {
  linkedin: Linkedin,
  telegram: Send,
  instagram: Instagram,
  website: Globe,
};

const TeamPage = () => {
  const { lang } = useLanguage();

  const { data: members, isLoading } = useQuery({
    queryKey: ["team-members-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
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
              {lang === "uz" ? "Bizning jamoa" : "Our Team"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "uz"
                ? "Muhandis platformasi ortidagi professional jamoa"
                : "The professional team behind the Muhandis platform"}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && members?.length === 0 && (
            <p className="text-center text-muted-foreground py-16">
              {lang === "uz" ? "Jamoa a'zolari hali qo'shilmagan" : "No team members added yet"}
            </p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members?.map((member) => {
              const socials = (member.social_links as Record<string, string>) || {};
              return (
                <div key={member.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-56 bg-muted overflow-hidden">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                        {member.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-card-foreground">
                      {lang === "en" && member.full_name_en ? member.full_name_en : member.full_name}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-2">
                      {lang === "en" && member.role_title_en ? member.role_title_en : member.role_title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {lang === "en" && member.bio_en ? member.bio_en : member.bio}
                    </p>
                    {Object.keys(socials).length > 0 && (
                      <div className="flex gap-2">
                        {Object.entries(socials).map(([key, url]) => {
                          const Icon = socialIcons[key] || Globe;
                          return url ? (
                            <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                              className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                              <Icon className="w-4 h-4" />
                            </a>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TeamPage;
