import { FileText, Eye, MessageSquare, Users, Plus, Upload, BarChart3, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { data: articles } = useArticles();
  const { data: categories } = useCategories();

  const totalArticles = articles?.length ?? 0;
  const publishedCount = articles?.filter((a) => a.status === "published").length ?? 0;
  const draftCount = articles?.filter((a) => a.status === "draft").length ?? 0;
  const totalViews = articles?.reduce((sum, a) => sum + (a.views_count || 0), 0) ?? 0;

  const categoryData = categories?.map((c) => ({
    name: c.name,
    value: articles?.filter((a) => a.category_id === c.id).length ?? 0,
    color: c.color || "#0066CC",
  })).filter((c) => c.value > 0) ?? [];

  const recentArticles = articles?.slice(0, 5) ?? [];

  const stats = [
    { label: "Total Articles", value: totalArticles, icon: FileText, change: `${publishedCount} published`, color: "text-primary" },
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, change: `${draftCount} drafts`, color: "text-accent" },
    { label: "Categories", value: categories?.length ?? 0, icon: MessageSquare, change: "Active", color: "text-secondary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Muhandiss.uz control panel</p>
        </div>
        <Button asChild>
          <Link to="/admin/articles/new"><Plus className="h-4 w-4 mr-1" /> New Article</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {categoryData.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Category Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Articles</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/admin/articles">View All</Link></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentArticles.map((article: any) => (
              <div key={article.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {article.categories?.name || "—"} · {article.created_at ? new Date(article.created_at).toLocaleDateString() : ""}
                  </p>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  article.status === "published" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                )}>
                  {article.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
            ))}
            {recentArticles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No articles yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link to="/admin/articles/new"><Plus className="h-4 w-4 mr-1" /> Write Article</Link></Button>
            <Button variant="outline" asChild><Link to="/admin/media"><Upload className="h-4 w-4 mr-1" /> Upload Media</Link></Button>
            <Button variant="outline" asChild><Link to="/"><ExternalLink className="h-4 w-4 mr-1" /> View Site</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
