import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List Ambition Sports catalog products, optionally filtered by category or a text search on the product name.",
  inputSchema: {
    category: z.string().trim().max(60).optional().describe("Category slug, e.g. activewear, sportswear, casualwear."),
    search: z.string().trim().max(120).optional().describe("Free text matched against the product name."),
    limit: z.number().int().min(1).max(100).default(25).describe("Maximum number of products to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("products")
      .select("id, name, slug, category, price, stock, status, is_active, is_featured")
      .order("sort_order", { ascending: true })
      .limit(limit);
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { products: data ?? [], count: data?.length ?? 0 },
    };
  },
});
