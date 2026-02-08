import { Plus, Trash2, Youtube, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockAlbums = [
  { id: 1, name: "Muhandislik forumi 2026", count: 24, date: "2026-01-20", cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&q=60" },
  { id: 2, name: "Laboratoriya mashg'ulotlari", count: 18, date: "2026-01-15", cover: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&q=60" },
  { id: 3, name: "Jamoa uchrashuvlari", count: 12, date: "2026-02-01", cover: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&q=60" },
];

const mockVideos = [
  { id: 1, title: "Muhandislik haqida podcast #1", url: "https://youtube.com/watch?v=example1", date: "2026-02-05" },
  { id: 2, title: "3D printer ishlash jarayoni", url: "https://youtube.com/watch?v=example2", date: "2026-01-28" },
  { id: 3, title: "Robotni dasturlash", url: "https://youtube.com/watch?v=example3", date: "2026-01-22" },
];

const MediaCornerAdmin = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">OAV burchagi</h1>
        <p className="text-sm text-muted-foreground">Galereya va video boshqaruvi</p>
      </div>
    </div>

    <Tabs defaultValue="albums">
      <TabsList>
        <TabsTrigger value="albums"><ImageIcon className="h-4 w-4 mr-1" /> Albomlar</TabsTrigger>
        <TabsTrigger value="videos"><Youtube className="h-4 w-4 mr-1" /> Videolar</TabsTrigger>
      </TabsList>

      <TabsContent value="albums" className="mt-4 space-y-4">
        <div className="flex justify-end">
          <Button><Plus className="h-4 w-4 mr-1" /> Yangi albom</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAlbums.map((album) => (
            <Card key={album.id} className="overflow-hidden group">
              <div className="aspect-video relative">
                <img src={album.cover} alt={album.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary">Tahrirlash</Button>
                  <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm text-foreground">{album.name}</p>
                <p className="text-xs text-muted-foreground">{album.count} ta rasm · {album.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="videos" className="mt-4 space-y-4">
        <div className="flex justify-end">
          <Button><Plus className="h-4 w-4 mr-1" /> Video qo'shish</Button>
        </div>
        <div className="space-y-3">
          {mockVideos.map((video) => (
            <Card key={video.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Youtube className="h-8 w-8 text-destructive shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-foreground">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.url} · {video.date}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  </div>
);

export default MediaCornerAdmin;
