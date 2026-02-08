import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Eye, Users, FileText } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const viewsOverTime = [
  { name: "01 Fev", views: 420 }, { name: "02 Fev", views: 380 }, { name: "03 Fev", views: 510 },
  { name: "04 Fev", views: 620 }, { name: "05 Fev", views: 450 }, { name: "06 Fev", views: 780 },
  { name: "07 Fev", views: 690 }, { name: "08 Fev", views: 550 },
];

const topArticles = [
  { title: "GPT modellarining tahlili", views: 2100 },
  { title: "Kvant kompyuterlari", views: 1240 },
  { title: "3D bosma texnologiyasi", views: 890 },
  { title: "Formula 1 ERS tizimi", views: 750 },
  { title: "Mexatronika: robotlar", views: 620 },
];

const trafficSources = [
  { name: "Telegram", value: 42, color: "hsl(210, 100%, 40%)" },
  { name: "Google", value: 28, color: "hsl(174, 71%, 47%)" },
  { name: "To'g'ridan-to'g'ri", value: 18, color: "hsl(17, 100%, 60%)" },
  { name: "Boshqa", value: 12, color: "hsl(215, 16%, 47%)" },
];

const AnalyticsAdmin = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analitika</h1>
        <p className="text-sm text-muted-foreground">So'nggi 7 kunlik statistika</p>
      </div>
      <Button variant="outline"><Download className="h-4 w-4 mr-1" /> Eksport</Button>
    </div>

    {/* Summary */}
    <div className="grid sm:grid-cols-3 gap-4">
      <Card><CardContent className="p-4 flex items-center gap-3"><Eye className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold text-foreground">4,400</p><p className="text-xs text-muted-foreground">Haftalik ko'rishlar</p></div></CardContent></Card>
      <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-accent" /><div><p className="text-2xl font-bold text-foreground">312</p><p className="text-xs text-muted-foreground">Noyob tashriflar</p></div></CardContent></Card>
      <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-8 w-8 text-secondary" /><div><p className="text-2xl font-bold text-foreground">+12%</p><p className="text-xs text-muted-foreground">O'tgan haftaga nisbatan</p></div></CardContent></Card>
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
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AnalyticsAdmin;
