import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Article = Tables<"articles">;

export const useArticles = (filters?: { status?: string; categoryId?: string; search?: string }) => {
  return useQuery({
    queryKey: ["articles", filters],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("*, categories(name, slug, color)")
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.categoryId && filters.categoryId !== "all") {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const usePublishedArticles = (categorySlug?: string) => {
  return useQuery({
    queryKey: ["published-articles", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("*, categories(name, slug, color)")
        .eq("status", "published")
        .order("publish_date", { ascending: false });

      if (categorySlug) {
        query = query.eq("categories.slug", categorySlug);
      }
      const { data, error } = await query;
      if (error) throw error;
      // Filter out articles where category didn't match the join filter
      if (categorySlug) {
        return data?.filter((a: any) => a.categories !== null) || [];
      }
      return data || [];
    },
  });
};

export const useArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, categories(name, slug, color)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useArticleById = (id: string) => {
  return useQuery({
    queryKey: ["article-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, categories(name, slug, color)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (article: TablesInsert<"articles">) => {
      const { data, error } = await supabase.from("articles").insert(article).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });
};

export const useUpdateArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"articles"> & { id: string }) => {
      const { data, error } = await supabase.from("articles").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["published-articles"] });
    },
  });
};

export const useDeleteArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["published-articles"] });
    },
  });
};

export const useIncrementViews = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("increment_article_views" as any, { article_id: id });
      // Silently fail if function doesn't exist
      if (error) console.warn("Views increment failed:", error.message);
    },
  });
};
