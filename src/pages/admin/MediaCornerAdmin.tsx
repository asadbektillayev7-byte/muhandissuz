import { useState } from "react";
import { Plus, Trash2, Edit, MoreHorizontal, Youtube, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";

const emptyAlbum: any = { title: "", title_en: "", description: "", cover_url: "", album_date: "", is_active: true };
const emptyVideo: any = { title: "", title_en: "", description: "", thumbnail_url: "", video_url: "", event_date: "", is_active: true };

const MediaCornerAdmin = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"album" | "video">("album");
  const [form, setForm] = useState<any>(emptyAlbum);

  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ["admin-oav-albums"],
    queryFn: async () => {
      const { data, error } = await supabase.from("oav_albums").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ["admin-oav-videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("oav_videos").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-oav-albums"] });
    qc.invalidateQueries({ queryKey: ["admin-oav-videos"] });
    qc.invalidateQueries({ queryKey: ["oav-public"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingType === "album") {
        const data = {
          title: payload.title,
          title_en: payload.title_en || null,
          description: payload.description || null,
          cover_url: payload.cover_url || null,
          album_date: payload.album_date ? new Date(payload.album_date).toISOString() : null,
          is_active: payload.is_active ?? true,
          created_by: user?.id,
        };
        if (editingId) {
          const { error } = await supabase.from("oav_albums").update(data).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("oav_albums").insert(data);
          if (error) throw error;
        }
      } else {
        const data = {
          title: payload.title,
          title_en: payload.title_en || null,
          description: payload.description || null,
          thumbnail_url: payload.thumbnail_url || null,
          video_url: payload.video_url,
          event_date: payload.event_date ? new Date(payload.event_date).toISOString() : null,
          is_active: payload.is_active ?? true,
          created_by: user?.id,
        };
        if (editingId) {
          const { error } = await supabase.from("oav_videos").update(data).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("oav_videos").insert(data);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Yangilandi" : "Qo'shildi");
      setDialogOpen(false);
      setEditingId(null);
      setForm(editingType === "album" ? emptyAlbum : emptyVideo);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "album" | "video" }) => {
      const table = type === "album" ? "oav_albums" : "oav_videos";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("O'chirildi"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, type, is_active }: { id: string; type: "album" | "video"; is_active: boolean }) => {
      const table = type === "album" ? "oav_albums" : "oav_videos";
      const { error } = await supabase.from(table).update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = (type: "album" | "video") => {
    setEditingType(type);
    setForm(type === "album" ? emptyAlbum : emptyVideo);
    setEditingId(null);
    setDialogOpen(true);
  };
  const openEdit = (item: any, type: "album" | "video") => {
    setEditingType(type);
    setForm({
      ...item,
      album_date: item.album_date ? item.album_date.slice(0, 10) : "",
      event_date: item.event_date ? item.event_date.slice(0, 10) : "",
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">OAV burchagi</h1>
          <p className="text-sm text-muted-foreground">Albom va videolar boshqaruvi</p>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Tahrirlash" : "Yangi material"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Sarlavha *</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Sarlavha (EN)</Label><Input value={form.title_en || ""} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Tavsif</Label><Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            {editingType === "album" ? (
              <>
                <div className="space-y-1.5"><Label>Cover URL</Label><Input value={form.cover_url || ""} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Sana</Label><Input type="date" value={form.album_date || ""} onChange={(e) => setForm({ ...form, album_date: e.target.value })} /></div>
              </>
            ) : (
              <>
                <div className="space-y-1.5"><Label>Video URL *</Label><Input value={form.video_url || ""} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Thumbnail URL</Label><Input value={form.thumbnail_url || ""} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Sana</Label><Input type="date" value={form.event_date || ""} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
              </>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Faol</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
            <Button disabled={!form.title || (editingType === "video" && !form.video_url)} onClick={() => saveMutation.mutate(form)}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="albums">
        <TabsList>
          <TabsTrigger value="albums"><ImageIcon className="h-4 w-4 mr-1" /> Foto/Albomlar</TabsTrigger>
          <TabsTrigger value="videos"><Youtube className="h-4 w-4 mr-1" /> Videolar</TabsTrigger>
        </TabsList>

        <TabsContent value="albums" className="mt-4 space-y-4">
          <div className="flex justify-end"><Button onClick={() => openNew("album")}><Plus className="h-4 w-4 mr-1" /> Yangi albom</Button></div>
          {albumsLoading && <Skeleton className="h-40 w-full" />}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((item: any) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="aspect-video relative bg-muted">
                  {item.cover_url && <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(item, "album")}><Edit className="h-4 w-4 mr-2" />Tahrirlash</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate({ id: item.id, type: "album" })}><Trash2 className="h-4 w-4 mr-2" />O'chirish</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm text-foreground line-clamp-1">{item.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{item.album_date ? new Date(item.album_date).toLocaleDateString() : ""}</p>
                    <Switch checked={!!item.is_active} onCheckedChange={(v) => toggleMutation.mutate({ id: item.id, type: "album", is_active: v })} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-4 space-y-4">
          <div className="flex justify-end"><Button onClick={() => openNew("video")}><Plus className="h-4 w-4 mr-1" /> Video qo'shish</Button></div>
          {videosLoading && <Skeleton className="h-40 w-full" />}
          <div className="space-y-3">
            {videos.map((video: any) => (
              <Card key={video.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Youtube className="h-8 w-8 text-destructive shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{video.video_url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={!!video.is_active} onCheckedChange={(v) => toggleMutation.mutate({ id: video.id, type: "video", is_active: v })} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(video, "video")}><Edit className="h-4 w-4 mr-2" />Tahrirlash</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate({ id: video.id, type: "video" })}><Trash2 className="h-4 w-4 mr-2" />O'chirish</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaCornerAdmin;
