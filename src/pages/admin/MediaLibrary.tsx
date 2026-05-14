import { useState } from "react";
import { Upload, Trash2, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MediaLibrary = () => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const { data: media = [] } = useQuery({
    queryKey: ["admin-media-files"],
    queryFn: async () => {
      const { data, error } = await supabase.from("media_files").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = media.filter((m: any) => !search || m.file_name.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const removeMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const rows = media.filter((m: any) => ids.includes(m.id));
      for (const row of rows) {
        const { error: storageError } = await supabase.storage.from("media").remove([row.file_path]);
        if (storageError) throw storageError;
      }
      const { error } = await supabase.from("media_files").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["admin-media-files"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const path = `library/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
      if (uploadError) {
        toast.error(uploadError.message);
        continue;
      }
      const { error: insertError } = await supabase.from("media_files").insert({
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        file_type: file.type || null,
      });
      if (insertError) toast.error(insertError.message);
    }
    qc.invalidateQueries({ queryKey: ["admin-media-files"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media kutubxonasi</h1>
          <p className="text-sm text-muted-foreground">{media.length} ta fayl</p>
        </div>
        <Button asChild>
          <label className="cursor-pointer">
            <Upload className="h-4 w-4 mr-1" /> Yuklash
            <input type="file" multiple className="hidden" onChange={handleUpload} />
          </label>
        </Button>
      </div>

      {/* Upload area */}
      <Card>
        <CardContent className="p-6">
          <label className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-primary transition-colors cursor-pointer block">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Fayllarni shu yerga tashlang yoki <span className="text-primary font-medium">tanlang</span></p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP · Maks 10MB</p>
            <input type="file" multiple className="hidden" onChange={handleUpload} />
          </label>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Fayl qidirish..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {selected.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => removeMutation.mutate(selected)}><Trash2 className="h-4 w-4 mr-1" /> {selected.length} ta o'chirish</Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filtered.map((media: any) => (
          <Card key={media.id} className={`group cursor-pointer transition-all ${selected.includes(media.id) ? "ring-2 ring-primary" : ""}`}>
            <CardContent className="p-2">
              <div className="relative aspect-square rounded overflow-hidden mb-2">
                <img src={supabase.storage.from("media").getPublicUrl(media.file_path).data.publicUrl} alt={media.file_name} className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1">
                  <Checkbox
                    checked={selected.includes(media.id)}
                    onCheckedChange={() => toggleSelect(media.id)}
                    className="bg-card/80"
                  />
                </div>
              </div>
              <p className="text-xs font-medium truncate text-foreground">{media.file_name}</p>
              <p className="text-[10px] text-muted-foreground">{Math.round((media.file_size || 0) / 1024)} KB · {media.file_type || "file"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
