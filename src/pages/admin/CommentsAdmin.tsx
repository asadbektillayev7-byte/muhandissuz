import { Check, X, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Kutilmoqda", className: "bg-secondary/20 text-secondary" },
  approved: { label: "Tasdiqlangan", className: "bg-accent/20 text-accent" },
  rejected: { label: "Rad etilgan", className: "bg-muted text-muted-foreground" },
  spam: { label: "Spam", className: "bg-destructive/20 text-destructive" },
};

const CommentsAdmin = () => {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, author_name, content, status, created_at, articles(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-comments"] });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("comments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e.message),
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = filter === "all" ? comments : comments.filter((c: any) => c.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Izohlar</h1>
          <p className="text-sm text-muted-foreground">{comments.length} ta izoh</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="pending">Kutilmoqda</SelectItem>
            <SelectItem value="approved">Tasdiqlangan</SelectItem>
            <SelectItem value="rejected">Rad etilgan</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading && <Card><CardContent className="p-10 text-center text-muted-foreground">Yuklanmoqda...</CardContent></Card>}
        {!isLoading && filtered.map((comment: any) => {
          const st = statusConfig[comment.status] || statusConfig.pending;
          return (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-muted text-xs">{comment.author_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{comment.author_name || "Anonim"}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${st.className}`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        <MessageSquare className="h-3 w-3 inline mr-1" />{comment.articles?.title || "Maqola"} · {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {comment.status === "pending" && (
                      <>
                        <Button variant="ghost" size="icon" className="text-accent" onClick={() => updateStatus.mutate({ id: comment.id, status: "approved" })}><Check className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => updateStatus.mutate({ id: comment.id, status: "rejected" })}><X className="h-4 w-4" /></Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteComment.mutate(comment.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!isLoading && filtered.length === 0 && (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Izoh topilmadi</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default CommentsAdmin;
