import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

const mockCategories = [
  { id: 1, name: "Elektrotexnika", slug: "elektrotexnika", color: "#00B4D8", articles: 8, description: "Elektr va elektronika muhandisligi" },
  { id: 2, name: "Mexanika", slug: "mexanika", color: "#6C757D", articles: 5, description: "Mexanik muhandislik" },
  { id: 3, name: "Sun'iy Intellekt", slug: "suniy-intellekt", color: "#9D4EDD", articles: 6, description: "AI va mashinaviy o'rganish" },
  { id: 4, name: "Kimyo", slug: "kimyo", color: "#06FFA5", articles: 4, description: "Kimyoviy muhandislik" },
  { id: 5, name: "Motosport", slug: "motosport", color: "#DC2F02", articles: 3, description: "Avtomobil muhandisligi" },
  { id: 6, name: "Kosmik sanoat", slug: "kosmik-sanoat", color: "#03045E", articles: 4, description: "Kosmik texnologiyalar" },
  { id: 7, name: "Dasturiy ta'minot", slug: "dasturiy-taminot", color: "#0066CC", articles: 2, description: "Dasturlash va IT" },
  { id: 8, name: "Fuqarolik", slug: "fuqarolik", color: "#FF8C00", articles: 1, description: "Qurilish muhandisligi" },
  { id: 9, name: "Atrof-muhit", slug: "atrof-muhit", color: "#22C55E", articles: 1, description: "Ekologik muhandislik" },
  { id: 10, name: "Umumiy", slug: "umumiy", color: "#6C757D", articles: 0, description: "Umumiy muhandislik mavzulari" },
];

const CategoriesAdmin = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kategoriyalar</h1>
          <p className="text-sm text-muted-foreground">{mockCategories.length} ta kategoriya</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Yangi kategoriya</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi kategoriya</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nomi</Label>
                <Input placeholder="Kategoriya nomi" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input placeholder="kategoriya-nomi" />
              </div>
              <div className="space-y-2">
                <Label>Rang</Label>
                <Input type="color" defaultValue="#0066CC" className="h-10 w-20" />
              </div>
              <div className="space-y-2">
                <Label>Tavsif</Label>
                <Textarea placeholder="Kategoriya haqida qisqa ma'lumot" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
              <Button onClick={() => setDialogOpen(false)}>Saqlash</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Nomi</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Rang</TableHead>
                  <TableHead className="text-right">Maqolalar</TableHead>
                  <TableHead className="hidden md:table-cell">Tavsif</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" /></TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{cat.slug}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs text-muted-foreground">{cat.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{cat.articles}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{cat.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesAdmin;
