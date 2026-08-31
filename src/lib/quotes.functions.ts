import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type OrderStatus = 'pending' | 'designing' | 'production' | 'quality_check' | 'shipped' | 'delivered';

export const submitQuote = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    name: z.string(),
    email: z.string().email(),
    sportType: z.string(),
    quantity: z.number(),
    deadline: z.string(),
    designNotes: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const orderId = `AS-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    
    // 1. Store in database
    const { error: dbError } = await supabaseAdmin
      .from('quotes')
      .insert({
        tracking_id: orderId,
        name: data.name,
        email: data.email,
        sport_type: data.sportType,
        quantity: data.quantity,
        status: 'pending'
      });


    if (dbError) {
      console.error('Error saving quote:', dbError);
    }

    // 2. Send email notification
    const { sendInquiryEmail } = await import("./email.server");
    await sendInquiryEmail({
      name: data.name,
      email: data.email,
      subject: `New Custom Quote Request: ${orderId}`,
      message: data.designNotes,
      details: {
        orderId,
        sportType: data.sportType,
        quantity: data.quantity,
        deadline: data.deadline
      }
    });

    return { success: true as const, orderId };
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ orderId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: quote, error } = await supabaseAdmin
      .from('quotes')
      .select('tracking_id, status, created_at')
      .eq('tracking_id', data.orderId)
      .single();

    if (error || !quote) {
      throw new Error("Order not found");
    }
    
    return {
      orderId: quote.tracking_id || data.orderId,
      status: quote.status,
      updatedAt: quote.created_at,
      estimatedDelivery: "2026-09-15"
    };

  });

