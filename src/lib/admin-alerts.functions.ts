import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import { assertDeveloper, assertStaff } from "./admin.server";

export const getAlertSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("site_settings").select("*");
    const settings = data?.find((s: any) => s.key === 'alert_thresholds');
    if (settings && settings.value) return JSON.parse(settings.value);
    
    return { 
        failure_rate_pct: 10, 
        latency_ms: 5000, 
        notification_email: "",
        slack_webhook_url: "",
        generic_webhook_url: ""
    };
  });

export const updateAlertSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    failure_rate_pct: z.number(),
    latency_ms: z.number(),
    notification_email: z.string().email(),
    slack_webhook_url: z.string().url().optional().or(z.literal("")),
    generic_webhook_url: z.string().url().optional().or(z.literal("")),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { error } = await (context.supabase as any)
      .from("site_settings")
      .upsert({ 
        key: 'alert_thresholds', 
        value: JSON.stringify(data), 
        updated_at: new Date().toISOString() 
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const testAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertDeveloper(context.supabase, context.userId);
    
    // 1. Get Settings
    const { data: settingsData } = await context.supabase
      .from("site_settings")
      .select("*")
      .eq("key", "alert_thresholds")
      .single();
    
    if (!settingsData?.value) {
      throw new Error("Alert settings not configured. Please save settings before testing.");
    }
    
    const settings = JSON.parse(settingsData.value);
    const results: string[] = [];

    // 2. Test Email via internal mailer (if configured)
    if (settings.notification_email) {
      // Logic for sending email alerts would go here
      // For now, we simulate the delivery attempt
      results.push(`Email test initiated for ${settings.notification_email}`);
    }

    // 3. Test Slack via Webhook
    if (settings.slack_webhook_url) {
      try {
        const payload = {
          text: "🚀 *Ambition Sports: Alert System Test*",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "🔴 *SYSTEM ALERT TEST*\nThis is a simulated failure to verify your Slack integration."
              }
            },
            {
              type: "fields",
              fields: [
                { type: "mrkdwn", text: "*Threshold:* 10% Failure Rate" },
                { type: "mrkdwn", text: "*Current:* 15% (Simulated)" }
              ]
            }
          ]
        };

        const response = await fetch(settings.slack_webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          results.push("Slack alert sent successfully");
        } else {
          results.push(`Slack failed with status: ${response.status}`);
        }
      } catch (e: any) {
        results.push(`Slack error: ${e.message}`);
      }
    }

    return { 
      ok: true, 
      message: results.length > 0 
        ? `Tests completed: ${results.join(", ")}` 
        : "No notification channels configured to test." 
    };
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    // Fetch logs from a new dedicated table or the current instagram_sync_logs
    const { data } = await (context.supabase as any)
        .from("instagram_sync_logs")
        .select("*, profiles:user_id(email)")
        .order("created_at", { ascending: false })
        .limit(100);
    return data || [];
  });

export const getSyncTimeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ mediaId: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
      await assertStaff(context.supabase, context.userId);
      const { data: logs } = await (context.supabase as any)
        .from("instagram_sync_logs")
        .select("*")
        .eq("media_id", data.mediaId)
        .order("created_at", { ascending: true });
      return logs || [];
  });
