import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const submitInquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z.object({
      name: z.string().min(2),
      email: z.string().email(),
      subject: z.string().min(2),
      message: z.string().min(10),
      details: z.record(z.string(), z.any()).optional(),
    }).parse(data);
  })
  .handler(async ({ data }) => {
    // 1. Store in database using the publishable key (anon insert policy),
    // so this keeps working even where no service-role key is configured.
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ||
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
      process.env["SUPABASE_ANON_KEY"] ||
      process.env["VITE_SUPABASE_ANON_KEY"];

    if (!url || !key) throw new Error("Backend is not configured");

    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: dbError } = await client
      .from('inquiries')
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
        type: data.subject, // Map subject to 'type' column
        status: 'pending'
      });


    if (dbError) {
      console.error('Error saving inquiry:', dbError);
      throw new Error(dbError.message);
    }

    // 2. Send email (never fail the inquiry if mail delivery is unavailable)
    let result: { success: boolean; error?: unknown; data?: unknown } = { success: false };
    try {
      const { sendInquiryEmail } = await import("./email.server");
      result = await sendInquiryEmail({
        ...data,
        details: data.details as Record<string, any>
      });
    } catch (mailError) {
      console.error("Inquiry email threw:", mailError);
    }

    if (!result.success) {
      console.error("Inquiry email delivery failed:", result.error);
    }

    return {
      success: true as const,
      emailed: result.success,
      data: result.success ? result.data || null : null,
      mock: (result as any).mock || false
    };
  });

