import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getPageSeo = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ path: z.string() }).parse(data))
  .handler(async ({ data: { path } }) => {
    const { data: content } = await supabase
      .from("page_content")
      .select("title, body")
      .eq("page", path)
      .eq("section_key", "seo")
      .maybeSingle();

    if (!content) return null;

    try {
      const seo = JSON.parse(content.body || "{}");
      return {
        title: content.title || seo.title || "",
        description: seo.description || "",
        ogImage: seo.ogImage || "",
      };
    } catch {
      return {
        title: content.title || "",
        description: "",
        ogImage: "",
      };
    }
  });

export const savePageSeo = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ 
    path: z.string(), 
    seo: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
    })
  }).parse(data))
  .handler(async ({ data: { path, seo } }) => {
    // Note: In real app, check auth role here
    const { error } = await supabase
      .from("page_content")
      .upsert({
        page: path,
        section_key: "seo",
        title: seo.title,
        body: JSON.stringify(seo),
        sort_order: 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: "page, section_key" });

    if (error) throw new Error(error.message);
    return { success: true };
  });
