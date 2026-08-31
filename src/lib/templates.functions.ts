import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import { assertStaff } from "./admin.server";

export const applyTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    type: z.enum(["business", "store"]),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const s = context.supabase;

    if (data.type === "business") {
      // Branding for a standard business site
      const branding = {
        logoText: "Ambition Enterprise",
        notificationText: "Leading Apparel Manufacturer & Exporter",
        footerDescription: "Global leaders in premium apparel manufacturing, providing end-to-end solutions for teams and corporate entities.",
        showTopInfoBar: true,
        showSocialIcons: true,
        showWhatsappButton: false,
      };
      await s.from("site_settings").upsert({ key: "branding", value: JSON.stringify(branding) });
      await s.from("site_settings").upsert({ key: "site_mode", value: "business" });
    } else {
      // Branding and initial products for a store
      const branding = {
        logoText: "Ambition Shop",
        notificationText: "Shop the Latest Pro Performance Gear — Free Shipping over $100",
        footerDescription: "Your one-stop shop for elite performance gear. Designed for athletes, worn by champions.",
        showTopInfoBar: true,
        showSocialIcons: true,
        showWhatsappButton: true,
      };
      await s.from("site_settings").upsert({ key: "branding", value: JSON.stringify(branding) });
      await s.from("site_settings").upsert({ key: "site_mode", value: "store" });

      // Add a few sample products if empty
      const { count } = await s.from("products").select("id", { count: "exact", head: true });
      if (count === 0) {
        await s.from("products").insert([
          { 
            name: "Pro Performance Jersey", 
            slug: "pro-performance-jersey", 
            category: "sportswear", 
            price: 49.99, 
            stock: 100,
            images: ["https://images.unsplash.com/photo-1580087442694-034514f75817?q=80&w=800"],
            description: "Elite performance jersey with moisture-wicking technology."
          },
          { 
            name: "Elite Training Shorts", 
            slug: "elite-training-shorts", 
            category: "activewear", 
            price: 29.99, 
            stock: 150,
            images: ["https://images.unsplash.com/photo-1591197172059-2179722328c8?q=80&w=800"],
            description: "Lightweight training shorts for maximum mobility."
          }
        ]);
      }
    }

    return { success: true };
  });
