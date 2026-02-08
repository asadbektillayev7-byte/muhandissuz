import { Plus, Edit, Trash2, MoreHorizontal, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockScientific = [
  { id: 1, title: "Qayta tiklanuvchi energiya: shamol turbinalari samaradorligi", author: "Dr. Sardor Alimov", coAuthors: "N. Karimova", keywords: "energiya, shamol, turbina", doi: "10.1234/muh.2026.001", date: "2026-01-15" },
  { id: 2, title: "Neyron tarmoqlarining optimallashtirish usullari", author: "Dr. Aziza Raxmatova", coAuthors: "J. Toshmatov", keywords: "AI, neyron, optimallash", doi: "10.1234/muh.2026.002", date: "2026-01-20" },
  { id: 3, title: "Kimyoviy sanoatda katalitik jarayonlarning yangi yondashuvlari", author: "Dr. Malika Xasanova", coAuthors: "", keywords: "kimyo, kataliz, sanoat", doi: "", date: "2026-02-01" },
];

const ScientificArticlesAdmin = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ilmiy maqolalar</h1>
        <p className="text-sm text-muted-foreground">{mockScientific.length} ta ilmiy maqola</p>
      </div>
      <Button><Plus className="h-4 w-4 mr-1" /> Yangi ilmiy maqola</Button>
    </div>

    <Card>
      <CardContent className="p-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sarlavha</TableHead>
                <TableHead>Muallif</TableHead>
                <TableHead className="hidden md:table-cell">Hammualliflar</TableHead>
                <TableHead className="hidden lg:table-cell">Kalit so'zlar</TableHead>
                <TableHead className="hidden lg:table-cell">DOI</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockScientific.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[250px] truncate">{article.title}</TableCell>
                  <TableCell className="text-sm">{article.author}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{article.coAuthors || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{article.keywords}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{article.doi || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{article.date}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Tahrirlash</DropdownMenuItem>
                        <DropdownMenuItem><FileDown className="h-4 w-4 mr-2" /> PDF yuklash</DropdownMenuItem>
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

export default ScientificArticlesAdmin;
