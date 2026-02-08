import { FileText, Eye, MessageSquare, Users, TrendingUp, Plus, Upload, BarChart3, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  { label: "Jami maqolalar", value: "34", icon: FileText, change: "+3 bu hafta", color: "text-primary" },
  { label: "Jami ko'rishlar", value: "12,458", icon: Eye, change: "+12% o'sish", color: "text-accent" },
  { label: "Yangi izohlar", value: "28", icon: MessageSquare, change: "5 ta kutilmoqda", color: "text-secondary" },
  { label: "Faol foydalanuvchilar", value: "156", icon: Users, change: "+8 bu oy", color: "text-primary" },
];

const viewsData = [
  { name: "Yan", views: 1200 },
  { name: "Fev", views: 1900 },
  { name: "Mar", views: 1600 },
  { name: "Apr", views: 2100 },
  { name: "May", views: 2400 },
  { name: "Iyun", views: 1800 },
];

const categoryData = [
  { name: "Elektrotexnika", value: 8, color: "hsl(195, 100%, 42%)" },
  { name: "Sun'iy Intellekt", value: 6, color: "hsl(271, 73%, 59%)" },
  { name: "Mexanika", value: 5, color: "hsl(210, 6%, 45%)" },
  { name: "Kimyo", value: 4, color: "hsl(157, 100%, 50%)" },
  { name: "Kosmik sanoat", value: 4, color: "hsl(220, 95%, 19%)" },
  { name: "Motosport", value: 3, color: "hsl(11, 97%, 50%)" },
  { name: "Boshqa", value: 4, color: "hsl(215, 16%, 47%)" },
];

const recentArticles = [
  { title: "Kvant kompyuterlari: yangi imkoniyatlar", category: "Elektrotexnika", date: "6 Fev", status: "published" },
  { title: "3D bosma texnologiyasi", category: "Kosmik sanoat", date: "4 Fev", status: "published" },
  { title: "Mexatronika: robotlar tizimi", category: "Mexanika", date: "2 Fev", status: "draft" },
  { title: "GPT modellarining tahlili", category: "Sun'iy Intellekt", date: "28 Yan", status: "published" },
  { title: "Formula 1 ERS tizimi", category: "Motosport", date: "25 Yan", status: "published" },
];

const activities = [
  { text: "Yangi maqola chop etildi: Elektr energiyasi", time: "2 soat oldin" },
  { text: "Jamoa a'zosi qo'shildi: Dilafuz Juraboeva", time: "5 soat oldin" },
  { text: "Izoh tasdiqlandi: Mexanik muhandislik", time: "1 kun oldin" },
  { text: "Kategoriya yangilandi: Sun'iy Intellekt", time: "2 kun oldin" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Muhandiss.uz boshqaruv paneli</p>
        </div>
        <Button asChild>
          <Link to="/admin/articles/new">
            <Plus className="h-4 w-4 mr-1" /> Yangi maqola
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={cn("p-3 rounded-lg bg-muted", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ko'rishlar statistikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={viewsData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(210, 100%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Kategoriya taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent articles + Activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">So'nggi maqolalar</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/articles">Barchasi</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentArticles.map((article, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.category} · {article.date}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      article.status === "published"
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {article.status === "published" ? "Chop etilgan" : "Qoralama"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">So'nggi faoliyat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{act.text}</p>
                    <p className="text-xs text-muted-foreground">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tezkor harakatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link to="/admin/articles/new"><Plus className="h-4 w-4 mr-1" /> Maqola yozish</Link></Button>
            <Button variant="outline" asChild><Link to="/admin/media"><Upload className="h-4 w-4 mr-1" /> Media yuklash</Link></Button>
            <Button variant="outline" asChild><Link to="/"><ExternalLink className="h-4 w-4 mr-1" /> Saytni ko'rish</Link></Button>
            <Button variant="outline" asChild><Link to="/admin/analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analitika</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default Dashboard;
