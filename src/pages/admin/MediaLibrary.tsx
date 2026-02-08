import { useState } from "react";
import { Upload, Trash2, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const mockMedia = [
  { id: 1, name: "kvant-kompyuter.jpg", size: "1.2 MB", dimensions: "1920x1080", date: "2026-02-06", url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&q=60" },
  { id: 2, name: "3d-bosma.jpg", size: "890 KB", dimensions: "1600x900", date: "2026-02-04", url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&q=60" },
  { id: 3, name: "robot-arm.jpg", size: "1.5 MB", dimensions: "1920x1280", date: "2026-02-02", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&q=60" },
  { id: 4, name: "gpt-model.jpg", size: "750 KB", dimensions: "1200x800", date: "2026-01-28", url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&q=60" },
  { id: 5, name: "f1-car.jpg", size: "2.1 MB", dimensions: "2560x1440", date: "2026-01-25", url: "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=300&q=60" },
  { id: 6, name: "laboratoriya.jpg", size: "980 KB", dimensions: "1600x1067", date: "2026-01-20", url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&q=60" },
];

const MediaLibrary = () => {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const filtered = mockMedia.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media kutubxonasi</h1>
          <p className="text-sm text-muted-foreground">{mockMedia.length} ta fayl</p>
        </div>
        <Button><Upload className="h-4 w-4 mr-1" /> Yuklash</Button>
      </div>

      {/* Upload area */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Fayllarni shu yerga tashlang yoki <span className="text-primary font-medium">tanlang</span></p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP · Maks 10MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Fayl qidirish..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {selected.length > 0 && (
          <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1" /> {selected.length} ta o'chirish</Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filtered.map((media) => (
          <Card key={media.id} className={`group cursor-pointer transition-all ${selected.includes(media.id) ? "ring-2 ring-primary" : ""}`}>
            <CardContent className="p-2">
              <div className="relative aspect-square rounded overflow-hidden mb-2">
                <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1">
                  <Checkbox
                    checked={selected.includes(media.id)}
                    onCheckedChange={() => toggleSelect(media.id)}
                    className="bg-card/80"
                  />
                </div>
              </div>
              <p className="text-xs font-medium truncate text-foreground">{media.name}</p>
              <p className="text-[10px] text-muted-foreground">{media.size} · {media.dimensions}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
