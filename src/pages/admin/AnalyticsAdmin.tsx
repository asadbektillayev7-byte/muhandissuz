import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Eye, Users, FileText } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AnalyticsAdmin = () => {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [articlesRes, profilesRes] = await Promise.all([
        supabase.from("articles").select("title, views_count, created_at"),
        supabase.from("profiles").select("id"),
      ]);
      if (articlesRes.error) throw articlesRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const articles = articlesRes.data || [];
      const totalViews = articles.reduce((sum, a: any) => sum + (a.views_count || 0), 0);
      const topArticles = [...articles]
        .sort((a: any, b: any) => (b.views_count || 0) - (a.views_count || 0))
        .slice(0, 5)
        .map((a: any) => ({ title: a.title, views: a.views_count || 0 }));

      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        return { key, name: d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" }), views: 0 };
      });

      const dayMap = new Map(last7Days.map((x) => [x.key, 0]));
      articles.forEach((a: any) => {
        if (!a.created_at) return;
        const k = new Date(a.created_at).toISOString().slice(0, 10);
        if (dayMap.has(k)) dayMap.set(k, (dayMap.get(k) || 0) + (a.views_count || 0));
      });
      const viewsOverTime = last7Days.map((d) => ({ name: d.name, views: dayMap.get(d.key) || 0 }));

      return {
        totalViews,
        totalUsers: profilesRes.data?.length || 0,
        topArticles,
        viewsOverTime,
      };
    },
  });

  const viewsOverTime = data?.viewsOverTime || Array.from({ length: 7 }).map((_, i) => ({ name: `${i + 1}`, views: 0 }));
  const topArticles = data?.topArticles || [];
  const trafficSources = [
    { name: "Telegram", value: 0, color: "hsl(210, 100%, 40%)" },
    { name: "Google", value: 0, color: "hsl(174, 71%, 47%)" },
    { name: "To'g'ridan-to'g'ri", value: 0, color: "hsl(17, 100%, 60%)" },
    { name: "Boshqa", value: 0, color: "hsl(215, 16%, 47%)" },
  ];

  return <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analitika</h1>
        <p className="text-sm text-muted-foreground">So'nggi 7 kunlik statistika</p>
      </div>
      <Button variant="outline"><Download className="h-4 w-4 mr-1" /> Eksport</Button>
    </div>

    {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
      <Card><CardContent className="p-4 flex items-center gap-3"><Eye className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold text-foreground">{(data?.totalViews || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Jami maqola ko'rishlari</p></div></CardContent></Card>
      <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-accent" /><div><p className="text-2xl font-bold text-foreground">{(data?.totalUsers || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Ro'yxatdan o'tgan foydalanuvchilar</p></div></CardContent></Card>
      <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-8 w-8 text-secondary" /><div><p className="text-2xl font-bold text-foreground">{topArticles.length}</p><p className="text-xs text-muted-foreground">Ko'rilgan maqolalar (top)</p></div></CardContent></Card>
    </div>

    <div className="grid lg:grid-cols-3 gap-4">
      {/* Views over time */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="text-base">Ko'rishlar dinamikasi</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={viewsOverTime}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="hsl(210, 100%, 40%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Traffic sources */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Trafik manbalari</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={trafficSources} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} ${value}%`}>
                {trafficSources.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Top articles */}
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Eng mashhur maqolalar</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topArticles.map((article, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                <span className="text-sm font-medium text-foreground">{article.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">{article.views.toLocaleString()} ko'rish</span>
            </div>
          ))}
          {topArticles.length === 0 && <p className="text-sm text-muted-foreground">Hali analitika ma'lumoti yo'q</p>}
        </div>
      </CardContent>
    </Card>
  </div>
  </div>;
};

export default AnalyticsAdmin;
