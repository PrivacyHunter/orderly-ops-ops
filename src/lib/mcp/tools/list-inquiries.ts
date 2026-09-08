import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_inquiries",
  title: "List inquiries",
  description:
    "List contact inquiries visible to the signed-in account, newest first. Staff accounts see all inquiries.",
  inputSchema: {
    status: z.string().trim().max(40).optional().describe("Filter by status, e.g. new, contacted, closed."),
    limit: z.number().int().min(1).max(100).default(25).describe("Maximum number of inquiries to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("inquiries")
      .select("id, name, email, type, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { inquiries: data ?? [], count: data?.length ?? 0 },
    };
  },
});
