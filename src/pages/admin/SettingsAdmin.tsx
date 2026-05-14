import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsAdmin = () => (
  <div className="space-y-4 max-w-4xl">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sozlamalar</h1>
        <p className="text-sm text-muted-foreground">Sayt sozlamalarini boshqarish</p>
      </div>
      <Button><Save className="h-4 w-4 mr-1" /> Saqlash</Button>
    </div>

    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">Umumiy</TabsTrigger>
        <TabsTrigger value="social">Ijtimoiy tarmoqlar</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="about">Loyiha haqida</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Sayt ma'lumotlari</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Sayt nomi</Label><Input defaultValue="Muhandiss.uz" /></div>
            <div className="space-y-2"><Label>Tagline</Label><Input defaultValue="O'zbekistonda muhandislik kelajagini quramiz" /></div>
            <div className="space-y-2"><Label>Til</Label><Input defaultValue="O'zbek" disabled /></div>
            <div className="space-y-2"><Label>Vaqt mintaqasi</Label><Input defaultValue="Asia/Tashkent (UTC+5)" disabled /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Logo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Yorug' rejim logo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                <p className="text-sm text-muted-foreground">Rasm yuklang</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Qorong'u rejim logo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                <p className="text-sm text-muted-foreground">Rasm yuklang</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="social" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Ijtimoiy tarmoq havolalari</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Instagram</Label><Input placeholder="https://instagram.com/..." /></div>
            <div className="space-y-2"><Label>YouTube</Label><Input placeholder="https://youtube.com/..." /></div>
            <div className="space-y-2"><Label>LinkedIn</Label><Input placeholder="https://linkedin.com/..." /></div>
            <div className="space-y-2"><Label>Telegram kanal</Label><Input defaultValue="@muhandis_department" /></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seo" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">SEO sozlamalari</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Standart meta tavsif</Label><Textarea defaultValue="Muhandiss.uz - O'zbek muhandislik ta'lim platformasi" rows={3} /></div>
            <div className="space-y-2"><Label>Google Analytics ID</Label><Input placeholder="G-XXXXXXXXXX" /></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="about" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Loyiha haqida</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Missiya</Label><Textarea placeholder="Loyiha missiyasi..." rows={4} /></div>
            <div className="space-y-2"><Label>Jamoa haqida</Label><Textarea placeholder="Jamoa haqida umumiy ma'lumot..." rows={4} /></div>
            <div className="space-y-2"><Label>Aloqa email</Label><Input placeholder="info@muhandiss.uz" /></div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default SettingsAdmin;
