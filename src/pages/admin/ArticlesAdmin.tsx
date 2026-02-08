import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const mockArticles = [
  { id: 1, title: "Kvant kompyuterlari: yangi imkoniyatlar", author: "Sardor Alimov", category: "Elektrotexnika", status: "published", views: 1240, date: "2026-02-06", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=80&q=60" },
  { id: 2, title: "3D bosma texnologiyasi", author: "Nodira Karimova", category: "Kosmik sanoat", status: "published", views: 890, date: "2026-02-04", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=80&q=60" },
  { id: 3, title: "Mexatronika: robotlar tizimi", author: "Jasur Toshmatov", category: "Mexanika", status: "draft", views: 0, date: "2026-02-02", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=80&q=60" },
  { id: 4, title: "GPT modellarining tahlili", author: "Aziza Raxmatova", category: "Sun'iy Intellekt", status: "published", views: 2100, date: "2026-01-28", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=80&q=60" },
  { id: 5, title: "Formula 1 ERS tizimi", author: "Bekzod Umarov", category: "Motosport", status: "published", views: 750, date: "2026-01-25", image: "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=80&q=60" },
  { id: 6, title: "Kimyoviy katalitik jarayonlar", author: "Malika Xasanova", category: "Kimyo", status: "scheduled", views: 0, date: "2026-02-10", image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=80&q=60" },
];

const statusLabels: Record<string, { label: string; className: string }> = {
  published: { label: "Chop etilgan", className: "bg-accent/20 text-accent" },
  draft: { label: "Qoralama", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Rejalashtirilgan", className: "bg-secondary/20 text-secondary" },
};

const ArticlesAdmin = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<number[]>([]);

  const filtered = mockArticles.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((a) => a.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maqolalar</h1>
          <p className="text-sm text-muted-foreground">{mockArticles.length} ta maqola</p>
        </div>
        <Button asChild>
          <Link to="/admin/articles/new"><Plus className="h-4 w-4 mr-1" /> Yangi maqola</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Maqola qidirish..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kategoriya" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                <SelectItem value="Elektrotexnika">Elektrotexnika</SelectItem>
                <SelectItem value="Mexanika">Mexanika</SelectItem>
                <SelectItem value="Sun'iy Intellekt">Sun'iy Intellekt</SelectItem>
                <SelectItem value="Kimyo">Kimyo</SelectItem>
                <SelectItem value="Motosport">Motosport</SelectItem>
                <SelectItem value="Kosmik sanoat">Kosmik sanoat</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Holat" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="published">Chop etilgan</SelectItem>
                <SelectItem value="draft">Qoralama</SelectItem>
                <SelectItem value="scheduled">Rejalashtirilgan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-3 mb-3 p-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">{selected.length} ta tanlangan</span>
              <Button variant="destructive" size="sm"><Trash2 className="h-3 w-3 mr-1" /> O'chirish</Button>
            </div>
          )}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></TableHead>
                  <TableHead className="w-14">Rasm</TableHead>
                  <TableHead>Sarlavha</TableHead>
                  <TableHead className="hidden md:table-cell">Muallif</TableHead>
                  <TableHead className="hidden sm:table-cell">Kategoriya</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Ko'rishlar</TableHead>
                  <TableHead className="hidden lg:table-cell">Sana</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((article) => {
                  const st = statusLabels[article.status];
                  return (
                    <TableRow key={article.id}>
                      <TableCell><Checkbox checked={selected.includes(article.id)} onCheckedChange={() => toggleSelect(article.id)} /></TableCell>
                      <TableCell><img src={article.image} alt="" className="h-10 w-10 rounded object-cover" /></TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{article.title}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{article.author}</TableCell>
                      <TableCell className="hidden sm:table-cell"><span className="text-xs bg-muted px-2 py-1 rounded-full">{article.category}</span></TableCell>
                      <TableCell><span className={`text-xs px-2 py-1 rounded-full font-medium ${st.className}`}>{st.label}</span></TableCell>
                      <TableCell className="hidden lg:table-cell text-right">{article.views.toLocaleString()}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{article.date}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Tahrirlash</DropdownMenuItem>
                            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Ko'rish</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> O'chirish</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      Maqola topilmadi
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">{filtered.length} ta maqola</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm text-muted-foreground">1 / 1</span>
              <Button variant="outline" size="sm" disabled><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticlesAdmin;
