import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

const blocksSchema = z.object({
  workflow: z
    .array(
      z.object({
        num: z.string().max(4),
        title: z.string().min(1).max(60),
        desc: z.string().max(200).default(""),
        image: z.string().max(600).default(""),
      }),
    )
    .max(12),
  social: z.object({
    facebook: z.string().max(300).default(""),
    instagram: z.string().max(300).default(""),
    twitter: z.string().max(300).default(""),
    linkedin: z.string().max(300).default(""),
    whatsapp: z.string().max(300).default(""),
    threads: z.string().max(300).default(""),
  }),
  pageBanners: z
    .record(
      z.string(),
      z.object({
        eyebrow: z.string().max(120).default(""),
        title1: z.string().max(120).default(""),
        title2: z.string().max(120).default(""),
        subtitle: z.string().max(240).default(""),
        image: z.string().max(600).default(""),
      }),
    )
    .default({}),
  catalog: z
    .object({
      title: z.string().max(120).default(""),
      subtitle: z.string().max(240).default(""),
      buttonLabel: z.string().max(60).default(""),
      fileUrl: z.string().max(600).default(""),
    })
    .default({ title: "", subtitle: "", buttonLabel: "", fileUrl: "" }),
  facilities: z
    .object({
      eyebrow: z.string().max(120).default(""),
      title1: z.string().max(60).default(""),
      title2: z.string().max(60).default(""),
      description: z.string().max(600).default(""),
      image1: z.string().max(600).default(""),
      image2: z.string().max(600).default(""),
      fabricImage1: z.string().max(600).default(""),
      fabricImage2: z.string().max(600).default(""),
      fabricLabel1: z.string().max(40).default(""),
      fabricLabel2: z.string().max(40).default(""),
      stat1Value: z.string().max(20).default(""),
      stat1Label: z.string().max(40).default(""),
      stat2Value: z.string().max(20).default(""),
      stat2Label: z.string().max(40).default(""),
      buttonLabel: z.string().max(60).default(""),
      buttonUrl: z.string().max(300).default(""),
    })
    .default({
      eyebrow: "",
      title1: "",
      title2: "",
      description: "",
      image1: "",
      image2: "",
      fabricImage1: "",
      fabricImage2: "",
      fabricLabel1: "",
      fabricLabel2: "",
      stat1Value: "",
      stat1Label: "",
      stat2Value: "",
      stat2Label: "",
      buttonLabel: "",
      buttonUrl: "",
    }),
  categories: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        desc: z.string().max(240).default(""),
        image: z.string().max(600).default(""),
        url: z.string().max(300).default("/sportswear"),
      }),
    )
    .max(24)
    .default([]),
  showcase: z
    .array(
      z.object({
        image: z.string().max(600).default(""),
        alt: z.string().max(200).default(""),
      }),
    )
    .max(12)
    .default([]),
});

export const getSiteBlocks = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchSiteBlocks } = await import("./site-blocks.server");
  return fetchSiteBlocks();
});

export const saveSiteBlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => blocksSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { updateSiteBlocks } = await import("./site-blocks.server");
    return updateSiteBlocks(context.supabase, context.userId, data);
  });
