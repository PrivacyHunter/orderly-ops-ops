import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

export const getLandingPageContent = createServerFn({ method: "GET" })
  .handler(async () => {
    const { fetchLandingPageContent } = await import("./content.server");
    return fetchLandingPageContent();
  });

export const saveLandingPageContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    hero: z.object({
      ctaText: z.string().min(1),
      title: z.string().min(1)
    })
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { updateLandingPageContent } = await import("./content.server");
    return updateLandingPageContent(context.supabase, context.userId, data);
  });

export const getFooterContent = createServerFn({ method: "GET" })
  .handler(async () => {
    const { fetchFooterContent } = await import("./content.server");
    return fetchFooterContent();
  });

export const saveFooterContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    description: z.string(),
    copyright: z.string(),
    newsletterTitle: z.string(),
    newsletterDescription: z.string()
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { updateFooterContent } = await import("./content.server");
    return updateFooterContent(context.supabase, context.userId, data);
  });
