import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const slugify = (s: string) => s.toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || `art-${Date.now()}`;

const empty: any = {
  title: "", title_en: "", abstract: "", author_name: "", co_authors: "",
  keywords: "", doi: "", pdf_url: "", status: "published",
};

const ScientificArticlesAdmin = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-scientific"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scientific_articles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-scientific"] });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const data = {
        title: payload.title,
        title_en: payload.title_en || null,
        slug: payload.slug || slugify(payload.title),
        abstract: payload.abstract || null,
        author_name: payload.author_name,
        co_authors: payload.co_authors ? payload.co_authors.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
        keywords: payload.keywords ? payload.keywords.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
        doi: payload.doi || null,
        pdf_url: payload.pdf_url || null,
        status: payload.status || "published",
        created_by: user?.id,
      };
      if (editingId) {
        const { error } = await supabase.from("scientific_articles").update(data).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("scientific_articles").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Yangilandi" : "Qo'shildi");
      setDialogOpen(false); setEditingId(null); setForm(empty); invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scientific_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("O'chirildi"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => { setForm(empty); setEditingId(null); setDialogOpen(true); };
  const openEdit = (a: any) => {
    setForm({
      ...a,
      co_authors: Array.isArray(a.co_authors) ? a.co_authors.join(", ") : "",
      keywords: Array.isArray(a.keywords) ? a.keywords.join(", ") : "",
    });
    setEditingId(a.id); setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ilmiy maqolalar</h1>
          <p className="text-sm text-muted-foreground">{items.length} ta ilmiy maqola</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(empty); } }}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Yangi ilmiy maqola</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Tahrirlash" : "Yangi ilmiy maqola"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Sarlavha *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Sarlavha (EN)</Label><Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Annotatsiya</Label><Textarea rows={3} value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Muallif *</Label><Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Hammualliflar (vergul bilan)</Label><Input value={form.co_authors} onChange={(e) => setForm({ ...form, co_authors: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Kalit so'zlar (vergul bilan)</Label><Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>DOI</Label><Input value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>PDF URL</Label><Input value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Holat</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Qoralama</SelectItem>
                    <SelectItem value="published">Nashr qilingan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
              <Button disabled={!form.title || !form.author_name || saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
                {saveMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          {isLoading && <Skeleton className="h-40 w-full" />}
          {!isLoading && items.length === 0 && <p className="text-center text-muted-foreground py-8">Hali maqolalar yo'q</p>}
          {!isLoading && items.length > 0 && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sarlavha</TableHead>
                    <TableHead>Muallif</TableHead>
                    <TableHead className="hidden md:table-cell">Holat</TableHead>
                    <TableHead className="hidden lg:table-cell">DOI</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium max-w-[260px] truncate">{a.title}</TableCell>
                      <TableCell className="text-sm">{a.author_name}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{a.status}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{a.doi || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(a)}><Edit className="h-4 w-4 mr-2" /> Tahrirlash</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("O'chirilsinmi?")) deleteMutation.mutate(a.id); }}>
                              <Trash2 className="h-4 w-4 mr-2" /> O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScientificArticlesAdmin;
