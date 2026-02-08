import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockUsers = [
  { id: 1, name: "Admin User", email: "admin@muhandiss.uz", role: "Admin", lastLogin: "2026-02-08", status: "active" },
  { id: 2, name: "Sardor Alimov", email: "sardor@muhandiss.uz", role: "Editor", lastLogin: "2026-02-07", status: "active" },
  { id: 3, name: "Nodira Karimova", email: "nodira@muhandiss.uz", role: "Author", lastLogin: "2026-02-05", status: "active" },
  { id: 4, name: "Jasur Toshmatov", email: "jasur@muhandiss.uz", role: "Author", lastLogin: "2026-01-30", status: "inactive" },
  { id: 5, name: "Aziza Raxmatova", email: "aziza@muhandiss.uz", role: "Editor", lastLogin: "2026-02-06", status: "active" },
];

const roleColors: Record<string, string> = {
  Admin: "bg-destructive/20 text-destructive",
  Editor: "bg-primary/20 text-primary",
  Author: "bg-accent/20 text-accent",
};

const UsersAdmin = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Foydalanuvchilar</h1>
        <p className="text-sm text-muted-foreground">{mockUsers.length} ta foydalanuvchi</p>
      </div>
      <Button><Plus className="h-4 w-4 mr-1" /> Yangi foydalanuvchi</Button>
    </div>

    <Card>
      <CardContent className="p-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foydalanuvchi</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">Oxirgi kirish</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs">{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[user.role] || "bg-muted text-muted-foreground"}`}>{user.role}</span></TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${user.status === "active" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {user.status === "active" ? "Faol" : "Nofaol"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Tahrirlash</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> O'chirish</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default UsersAdmin;
