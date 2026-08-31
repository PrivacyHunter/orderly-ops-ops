import { createFileRoute } from '@tanstack/react-router';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/api/public/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const signature = request.headers.get('x-hub-signature-256') || request.headers.get('x-webhook-signature');
        
        // Fetch verification token
        const { data: settings } = await supabase.from('instagram_settings').select('webhook_verify_token').maybeSingle();
        const secret = settings?.webhook_verify_token || process.env['WEBHOOK_SECRET'];
        
        if (!secret) return new Response('Config error', { status: 500 });

        const hmac = createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(body).digest('hex'), 'utf8');
        const sigBuffer = Buffer.from(signature || '', 'utf8');

        if (!signature || !timingSafeEqual(sigBuffer, digest)) {
          return new Response('Invalid signature', { status: 401 });
        }

        const payload = JSON.parse(body);
        
        // Handle Instagram Webhook (e.g. 'entry' in Instagram API)
        if (payload.object === 'instagram') {
          // Trigger sync logic - call syncInstagramPosts or logic directly
          // Using a fetch to internal route or just logic to deduplicate media IDs
          // deduplication logic here: check instagram_posts existence
        }

        return new Response('ok');
      }
    }
  }
});
