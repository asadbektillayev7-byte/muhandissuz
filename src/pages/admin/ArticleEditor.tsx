import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/RichTextEditor";
import { useCategories } from "@/hooks/useCategories";
import { useArticleById, useCreateArticle, useUpdateArticle } from "@/hooks/useArticles";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const { data: existingArticle, isLoading: loadingArticle } = useArticleById(id || "");
  const { data: categories } = useCategories();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [tags, setTags] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title || "");
      setSlug(existingArticle.slug || "");
      setContent(existingArticle.content || "");
      setExcerpt(existingArticle.excerpt || "");
      setCategoryId(existingArticle.category_id || "");
      setStatus(existingArticle.status || "draft");
      setMetaTitle(existingArticle.meta_title || "");
      setMetaDescription(existingArticle.meta_description || "");
      setTags(existingArticle.tags?.join(", ") || "");
      setPublishDate(existingArticle.publish_date ? existingArticle.publish_date.slice(0, 16) : "");
      setFeaturedImage(existingArticle.featured_image || "");
    }
  }, [existingArticle]);

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing) setSlug(generateSlug(value));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `articles/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setFeaturedImage(urlData.publicUrl);
    toast({ title: "Image uploaded" });
  };

  const handleSave = async () => {
    if (!title || !slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const articleData = {
        title,
        slug,
        content,
        excerpt,
        category_id: categoryId || null,
        status,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
        publish_date: publishDate ? new Date(publishDate).toISOString() : (status === "published" ? new Date().toISOString() : null),
        featured_image: featuredImage || null,
        author_id: user?.id || null,
      };

      if (isEditing) {
        await updateArticle.mutateAsync({ id, ...articleData });
        toast({ title: "Article updated" });
        if (status === "published") {
          navigate("/admin/articles");
        }
      } else {
        await createArticle.mutateAsync(articleData);
        toast({ title: "Article created" });
        navigate("/admin/articles");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isEditing && loadingArticle) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/articles"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isEditing ? "Edit Article" : "New Article"}</h1>
            <p className="text-sm text-muted-foreground">Create and edit articles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && slug && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/article/${slug}`} target="_blank"><Eye className="h-4 w-4 mr-1" /> Preview</Link>
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Article title..." value={title} onChange={(e) => handleTitleChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea placeholder="Short description..." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
                <p className="text-xs text-muted-foreground">{excerpt.length}/300</p>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor content={content} onChange={setContent} placeholder="Write your article content..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input placeholder="SEO title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/60</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea placeholder="SEO description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} />
                <p className="text-xs text-muted-foreground">{metaDescription.length}/160</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Publish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Publish Date</Label>
                <Input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input placeholder="tag1, tag2, ..." value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Featured Image</CardTitle></CardHeader>
            <CardContent>
              {featuredImage ? (
                <div className="space-y-2">
                  <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-lg" />
                  <Button variant="outline" size="sm" onClick={() => setFeaturedImage("")}>Remove</Button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors block">
                  <p className="text-sm text-muted-foreground">Click to upload image</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
