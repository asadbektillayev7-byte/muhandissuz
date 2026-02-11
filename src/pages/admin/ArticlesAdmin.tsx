import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useArticles, useDeleteArticle } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const statusLabels: Record<string, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-accent/20 text-accent" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-secondary/20 text-secondary" },
};

const ArticlesAdmin = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const { data: articles, isLoading } = useArticles({
    status: statusFilter,
    categoryId: categoryFilter,
    search: search || undefined,
  });
  const { data: categories } = useCategories();
  const deleteArticle = useDeleteArticle();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await deleteArticle.mutateAsync(id);
      toast({ title: "Article deleted" });
      setSelected((prev) => prev.filter((s) => s !== id));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (!articles) return;
    setSelected(selected.length === articles.length ? [] : articles.map((a) => a.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Articles</h1>
          <p className="text-sm text-muted-foreground">{articles?.length ?? 0} articles</p>
        </div>
        <Button asChild>
          <Link to="/admin/articles/new"><Plus className="h-4 w-4 mr-1" /> New Article</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-3 mb-3 p-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">{selected.length} selected</span>
              <Button variant="destructive" size="sm" onClick={() => selected.forEach(handleDelete)}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          )}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={articles && selected.length === articles.length && articles.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="w-14">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Views</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}><Skeleton className="h-10 w-full" /></TableCell>
                  </TableRow>
                ))}
                {articles?.map((article: any) => {
                  const st = statusLabels[article.status] || statusLabels.draft;
                  return (
                    <TableRow key={article.id}>
                      <TableCell><Checkbox checked={selected.includes(article.id)} onCheckedChange={() => toggleSelect(article.id)} /></TableCell>
                      <TableCell>
                        {article.featured_image ? (
                          <img src={article.featured_image} alt="" className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{article.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {article.categories && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${article.categories.color}20`, color: article.categories.color }}>
                            {article.categories.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell><span className={`text-xs px-2 py-1 rounded-full font-medium ${st.className}`}>{st.label}</span></TableCell>
                      <TableCell className="hidden lg:table-cell text-right">{(article.views_count || 0).toLocaleString()}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {article.publish_date ? new Date(article.publish_date).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/articles/${article.id}/edit`}><Edit className="h-4 w-4 mr-2" /> Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/article/${article.slug}`} target="_blank"><Eye className="h-4 w-4 mr-2" /> View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(article.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isLoading && articles?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No articles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticlesAdmin;
