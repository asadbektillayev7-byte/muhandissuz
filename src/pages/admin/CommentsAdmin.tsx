import { Check, X, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const mockComments = [
  { id: 1, author: "Abdulloh", email: "abdulloh@mail.uz", article: "Kvant kompyuterlari", text: "Juda foydali maqola! Davomini kutib qolaman.", date: "2026-02-07", status: "pending" },
  { id: 2, author: "Dilnoza", email: "dilnoza@mail.uz", article: "GPT modellarining tahlili", text: "Sun'iy intellekt bo'yicha eng yaxshi O'zbek tilidagi maqola!", date: "2026-02-06", status: "approved" },
  { id: 3, author: "Otabek", email: "otabek@mail.uz", article: "Formula 1 ERS tizimi", text: "F1 texnologiyalari haqida ko'proq maqolalar yozing.", date: "2026-02-05", status: "approved" },
  { id: 4, author: "Spam bot", email: "spam@test.com", article: "3D bosma texnologiyasi", text: "Buy cheap products at...", date: "2026-02-04", status: "spam" },
  { id: 5, author: "Sardor", email: "sardor@mail.uz", article: "Mexatronika: robotlar tizimi", text: "Bu mavzuda qo'shimcha ma'lumot bera olasizmi?", date: "2026-02-03", status: "pending" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Kutilmoqda", className: "bg-secondary/20 text-secondary" },
  approved: { label: "Tasdiqlangan", className: "bg-accent/20 text-accent" },
  spam: { label: "Spam", className: "bg-destructive/20 text-destructive" },
};

const CommentsAdmin = () => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? mockComments : mockComments.filter(c => c.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Izohlar</h1>
          <p className="text-sm text-muted-foreground">{mockComments.length} ta izoh</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="pending">Kutilmoqda</SelectItem>
            <SelectItem value="approved">Tasdiqlangan</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((comment) => {
          const st = statusConfig[comment.status];
          return (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-muted text-xs">{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{comment.author}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${st.className}`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        <MessageSquare className="h-3 w-3 inline mr-1" />{comment.article} · {comment.date}
                      </p>
                      <p className="text-sm text-foreground">{comment.text}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {comment.status === "pending" && (
                      <>
                        <Button variant="ghost" size="icon" className="text-accent"><Check className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive"><X className="h-4 w-4" /></Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Izoh topilmadi</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default CommentsAdmin;
