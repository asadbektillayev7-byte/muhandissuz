import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ArticleEditor = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [tags, setTags] = useState("");

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(generateSlug(value));
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/articles"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Yangi maqola</h1>
            <p className="text-sm text-muted-foreground">Maqola yaratish va tahrirlash</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Ko'rish</Button>
          <Button size="sm"><Save className="h-4 w-4 mr-1" /> Saqlash</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Sarlavha</Label>
                <Input placeholder="Maqola sarlavhasi..." value={title} onChange={(e) => handleTitleChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Qisqa tavsif</Label>
                <Textarea placeholder="Maqola haqida qisqa ma'lumot..." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
                <p className="text-xs text-muted-foreground">{excerpt.length}/300</p>
              </div>
              <div className="space-y-2">
                <Label>Asosiy matn</Label>
                <Textarea
                  placeholder="Maqola matnini yozing... (Markdown qo'llab-quvvatlanadi)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="font-content"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">SEO sozlamalari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta sarlavha</Label>
                <Input placeholder="SEO sarlavhasi" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/60</p>
              </div>
              <div className="space-y-2">
                <Label>Meta tavsif</Label>
                <Textarea placeholder="SEO tavsifi" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} />
                <p className="text-xs text-muted-foreground">{metaDescription.length}/160</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Chop etish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Holat</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Qoralama</SelectItem>
                    <SelectItem value="published">Chop etilgan</SelectItem>
                    <SelectItem value="scheduled">Rejalashtirilgan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kategoriya</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elektrotexnika">Elektrotexnika</SelectItem>
                    <SelectItem value="mexanika">Mexanika</SelectItem>
                    <SelectItem value="ai">Sun'iy Intellekt</SelectItem>
                    <SelectItem value="kimyo">Kimyo</SelectItem>
                    <SelectItem value="motosport">Motosport</SelectItem>
                    <SelectItem value="kosmik">Kosmik sanoat</SelectItem>
                    <SelectItem value="dasturiy">Dasturiy ta'minot</SelectItem>
                    <SelectItem value="fuqarolik">Fuqarolik</SelectItem>
                    <SelectItem value="atrof">Atrof-muhit</SelectItem>
                    <SelectItem value="umumiy">Umumiy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chop etish sanasi</Label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label>Teglar</Label>
                <Input placeholder="teg1, teg2, ..." value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Asosiy rasm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <p className="text-sm text-muted-foreground">Rasm yuklash uchun bosing yoki shu yerga tashlang</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Muallif</CardTitle>
            </CardHeader>
            <CardContent>
              <Select>
                <SelectTrigger><SelectValue placeholder="Muallif tanlang" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sardor">Sardor Alimov</SelectItem>
                  <SelectItem value="nodira">Nodira Karimova</SelectItem>
                  <SelectItem value="jasur">Jasur Toshmatov</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
