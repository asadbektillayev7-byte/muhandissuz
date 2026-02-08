import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockTeam = [
  { id: 1, name: "Sardor Alimov", role: "Bosh muharrir", bio: "Elektrotexnika bo'yicha mutaxassis", active: true },
  { id: 2, name: "Nodira Karimova", role: "Muallif", bio: "Kosmik sanoat sohasida tadqiqotchi", active: true },
  { id: 3, name: "Jasur Toshmatov", role: "Muallif", bio: "Mexanika muhandisi", active: true },
  { id: 4, name: "Aziza Raxmatova", role: "Muharrir", bio: "Sun'iy intellekt bo'yicha tadqiqotchi", active: true },
  { id: 5, name: "Bekzod Umarov", role: "Muallif", bio: "Motosport texnologiyalari mutaxassisi", active: false },
  { id: 6, name: "Malika Xasanova", role: "Muallif", bio: "Kimyo muhandisi", active: true },
];

const TeamAdmin = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jamoa</h1>
          <p className="text-sm text-muted-foreground">{mockTeam.length} ta a'zo</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Yangi a'zo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi jamoa a'zosi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>To'liq ism</Label>
                <Input placeholder="Ism Familiya" />
              </div>
              <div className="space-y-2">
                <Label>Lavozim</Label>
                <Input placeholder="Muallif, Muharrir..." />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea placeholder="Qisqa ma'lumot" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Ta'lim</Label>
                <Input placeholder="Universitet/Maktab" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <Input placeholder="@username" />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input placeholder="URL" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
              <Button onClick={() => setDialogOpen(false)}>Saqlash</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTeam.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Tahrirlash</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> O'chirish</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{member.bio}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${member.active ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                  {member.active ? "Faol" : "Nofaol"}
                </span>
                <Switch checked={member.active} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamAdmin;
