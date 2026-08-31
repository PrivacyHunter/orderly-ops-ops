import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

const certificateSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  issuer: z.string().max(160).default(""),
  issue_date: z.string().max(60).default(""),
  details: z.string().max(600).default(""),
  image_url: z.string().max(600).default(""),
  sort_order: z.number().int().min(0).max(9999).default(10),
  is_active: z.boolean().default(true),
});

export const listCertificates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff } = await import("./admin.server");
    const { fetchAllCertificates } = await import("./certificates.server");
    await assertStaff(context.supabase, context.userId);
    return fetchAllCertificates(context.supabase);
  });

export const upsertCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => certificateSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./admin.server");
    const { saveCertificate } = await import("./certificates.server");
    await assertStaff(context.supabase, context.userId);
    return saveCertificate(context.supabase, data);
  });

export const deleteCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./admin.server");
    const { removeCertificate } = await import("./certificates.server");
    await assertStaff(context.supabase, context.userId);
    await removeCertificate(context.supabase, data.id);
    return { ok: true as const };
  });

export const getPublicCertificates = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchPublicCertificates } = await import("./certificates.server");
  return fetchPublicCertificates();
});
