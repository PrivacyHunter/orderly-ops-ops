import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ email: z.string().email() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();

    const { error } = await (supabaseAdmin as any)
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          status: "active",
          email_status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );

    if (error) throw new Error(error.message);

    const { sendNewsletterWelcomeEmail } = await import("./email.server");
    const result = await sendNewsletterWelcomeEmail(email);
    await (supabaseAdmin as any)
      .from("newsletter_subscribers")
      .update({
        email_status: result.success ? "sent" : "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (!result.success) console.error("Newsletter welcome email failed:", result.error);

    return { ok: true, emailed: result.success };
  });
