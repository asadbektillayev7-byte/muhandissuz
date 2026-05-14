import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Member = {
  id: string;
  full_name: string;
  full_name_en?: string | null;
  role_title?: string | null;
  bio?: string | null;
  education?: string | null;
  photo_url?: string | null;
  social_links?: any;
  is_active?: boolean | null;
  sort_order?: number | null;
};

const empty: Partial<Member> = {
  full_name: "", full_name_en: "", role_title: "", bio: "", education: "",
  photo_url: "", social_links: { telegram: "", linkedin: "" }, is_active: true,
};

const TeamAdmin = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<Member>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin-team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Member[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-team"] });
    qc.invalidateQueries({ queryKey: ["team-members-public"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<Member>) => {
      const social_links = payload.social_links || {};
      const data = {
        full_name: payload.full_name!,
        full_name_en: payload.full_name_en || null,
        role_title: payload.role_title || null,
        bio: payload.bio || null,
        education: payload.education || null,
        photo_url: payload.photo_url || null,
        social_links,
        is_active: payload.is_active ?? true,
      };
      if (editingId) {
        const { error } = await supabase.from("team_members").update(data).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("team_members").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Yangilandi" : "Qo'shildi");
      setDialogOpen(false); setEditingId(null); setForm(empty);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("O'chirildi"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("team_members").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => { setForm(empty); setEditingId(null); setDialogOpen(true); };
  const openEdit = (m: Member) => {
    setForm({ ...m, social_links: m.social_links || { telegram: "", linkedin: "" } });
    setEditingId(m.id); setDialogOpen(true);
  };

  const updateSocial = (k: string, v: string) =>
    setForm((f) => ({ ...f, social_links: { ...(f.social_links || {}), [k]: v } }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jamoa</h1>
          <p className="text-sm text-muted-foreground">{members.length} ta a'zo</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(empty); } }}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Yangi a'zo</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "A'zoni tahrirlash" : "Yangi jamoa a'zosi"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>To'liq ism *</Label>
                <Input value={form.full_name || ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>To'liq ism (EN)</Label>
                <Input value={form.full_name_en || ""} onChange={(e) => setForm({ ...form, full_name_en: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Lavozim</Label>
                <Input value={form.role_title || ""} onChange={(e) => setForm({ ...form, role_title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea rows={3} value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ta'lim</Label>
                <Input value={form.education || ""} onChange={(e) => setForm({ ...form, education: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Rasm URL</Label>
                <Input value={form.photo_url || ""} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <Input value={form.social_links?.telegram || ""} onChange={(e) => updateSocial("telegram", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input value={form.social_links?.linkedin || ""} onChange={(e) => updateSocial("linkedin", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active ?? true} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
                <Label>Faol</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
              <Button disabled={!form.full_name || saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
                {saveMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>}

      {!isLoading && members.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Hali a'zolar qo'shilmagan</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {member.photo_url && <AvatarImage src={member.photo_url} />}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{member.full_name}</p>
                    <p className="text-sm text-muted-foreground">{member.role_title}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(member)}><Edit className="h-4 w-4 mr-2" /> Tahrirlash</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("O'chirilsinmi?")) deleteMutation.mutate(member.id); }}>
                      <Trash2 className="h-4 w-4 mr-2" /> O'chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {member.bio && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{member.bio}</p>}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${member.is_active ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                  {member.is_active ? "Faol" : "Nofaol"}
                </span>
                <Switch checked={!!member.is_active} onCheckedChange={(c) => toggleActive.mutate({ id: member.id, is_active: c })} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamAdmin;
