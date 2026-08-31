import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { sendOrderConfirmationEmail } from "./email.server";


export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    email: z.string().email(),
    amount: z.number(),
    items: z.array(z.any()),
    shippingDetails: z.object({
      firstName: z.string(),
      lastName: z.string(),
      address: z.string(),
      city: z.string(),
      country: z.string(),
    }),
    paymentMethod: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    // This is where you would integrate Stripe PaymentIntent
    // For now, we simulate success and save to database
    
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        email: data.email,
        total_amount: data.amount,
        status: "pending",
        // stripe_payment_intent_id would go here
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // In a real app, you'd also save order_items here
    
    // Send confirmation email
    await sendOrderConfirmationEmail({
      email: data.email,
      orderId: order.id,
      amount: data.amount,
      items: data.items,
    });

    
    return { orderId: order.id, success: true };
  });
