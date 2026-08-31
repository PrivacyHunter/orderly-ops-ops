import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getSeoBulk = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: content } = await supabase
      .from("page_content")
      .select("page, title, body")
      .eq("section_key", "seo");

    const { data: products } = await supabase
      .from("products")
      .select("slug, name, description");

    return { content: content || [], products: products || [] };
  });

export const saveSeoBulk = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    updates: z.array(z.object({
      path: z.string(),
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
    }))
  }).parse(data))
  .handler(async ({ data: { updates } }) => {
    for (const update of updates) {
      const { path, title, description, ogImage } = update;
      await supabase
        .from("page_content")
        .upsert({
          page: path,
          section_key: "seo",
          title: title,
          body: JSON.stringify({ title, description, ogImage }),
          updated_at: new Date().toISOString(),
        }, { onConflict: "page, section_key" });
    }
    return { success: true };
  });

export const autoGenerateSeo = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    type: z.enum(["page", "product"]),
    name: z.string(),
    description: z.string().optional(),
  }).parse(data))
  .handler(async ({ data: { type, name, description } }) => {
    // Basic auto-SEO logic
    const title = `${name} | Ambition Sports`;
    const cleanDesc = description?.replace(/<[^>]*>?/gm, '').substring(0, 155) || `Premium ${name} from Ambition Sports. High-quality custom apparel and sportswear for elite teams.`;
    
    return { title, description: cleanDesc };
  });
