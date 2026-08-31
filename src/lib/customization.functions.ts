import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MOCK_VIDEOS = [
  {
    id: "1",
    title: "Vibrant Sublimation",
    description: "Our high-definition sublimation process fuses ink directly into the fibers, ensuring colors that never fade, crack, or peel.",
    video_url: "https://player.vimeo.com/external/494163967.hd.mp4?s=97e1694f410c538749a5893a7e4362b667232e01&profile_id=175",
    display_order: 1,
    is_published: true,
    captions: [
      { start: 0, end: 3, text: "Welcome to our Sublimation Studio" },
      { start: 4, end: 8, text: "Where vibrant colors come to life" }
    ]
  }
];

function storagePath(url: string | undefined) {
  if (!url) return null;
  const proxyMarker = "/api/public/media/studio-assets/";
  if (url.includes(proxyMarker)) return url.split(proxyMarker)[1] || null;
  const publicMarker = "storage/v1/object/public/studio-assets/";
  if (url.includes(publicMarker)) return url.split(publicMarker)[1] || null;
  return null;
}

export const getCustomizationVideos = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ all: z.boolean().optional() }).optional().parse(data))
  .handler(async ({ data: input }) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      let query = supabase.from('customization_videos').select('*');
      
      if (!input?.all) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query.order('display_order', { ascending: true });
      
      if (error || !data || data.length === 0) return MOCK_VIDEOS;
      return data;
    } catch (e) {
      return MOCK_VIDEOS;
    }
  });

export const upsertCustomizationVideo = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    video_url: z.string(),
    thumbnail_url: z.string().optional(),
    display_order: z.number().optional(),
    is_published: z.boolean().optional(),
    process_type: z.string().optional(),
    captions_url: z.string().optional(),
    captions_raw: z.string().optional(),
    caption_style: z.object({
      fontSize: z.string().optional(),
      color: z.string().optional(),
      position: z.string().optional(),
    }).optional(),
    captions: z.array(z.object({
      start: z.number(),
      end: z.number(),
      text: z.string(),
      language: z.string().optional(),
    })).optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    if (data.id) {
      const { data: existing } = await supabase.from('customization_videos').select('video_url').eq('id', data.id).single();
      const oldUrl = (existing as any)?.video_url;
      if (oldUrl && oldUrl !== data.video_url) {
        const path = storagePath(oldUrl);
        if (path) await supabase.storage.from('studio-assets').remove([path]);
      }
    }

    const { error } = await supabase
      .from('customization_videos')
      .upsert({
        ...data,
        updated_at: new Date().toISOString(),
      } as any);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteCustomizationVideo = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data: existing } = await supabase.from('customization_videos').select('video_url').eq('id', data.id).single();
    const oldUrl = (existing as any)?.video_url;
    if (oldUrl) {
      const path = storagePath(oldUrl);
      if (path) await supabase.storage.from('studio-assets').remove([path]);
    }

    const { error } = await supabase
      .from('customization_videos')
      .delete()
      .eq('id', data.id);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const bulkActionCustomizationVideos = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    ids: z.array(z.string()),
    action: z.enum(['publish', 'unpublish', 'delete'])
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    if (data.action === 'delete') {
      const { data: videos } = await supabase.from('customization_videos').select('video_url').in('id', data.ids);
      const paths = (videos || [])
        .map((v: any) => v.video_url)
        .map((url) => storagePath(url))
        .filter((path): path is string => Boolean(path));
      
      if (paths.length > 0) await supabase.storage.from('studio-assets').remove(paths);
      
      const { error } = await supabase.from('customization_videos').delete().in('id', data.ids);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from('customization_videos')
        .update({ is_published: data.action === 'publish' } as any)
        .in('id', data.ids);
      if (error) throw new Error(error.message);
    }
    
    return { success: true };
  });

export const trackVideoEngagement = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    video_id: z.string(),
    action: z.enum(['play', 'pause', 'watch_time']),
    value: z.number().optional(),
    visitor_id: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Using loose typing to bypass generation delay
    await (supabase.from('video_engagement' as any) as any).insert([data]);

    const column = data.action === 'play' ? 'total_plays' : data.action === 'pause' ? 'total_pauses' : 'total_time_watched';
    const increment = data.value || 1;

    await supabase.from('customization_videos')
      .update({ [column]: supabase.rpc('increment' as any, { row_id: data.video_id, amount: increment } as any) } as any)
      .eq('id', data.video_id);

    return { success: true };
  });

export const getEngagementStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase
      .from('customization_videos')
      .select('id, title, total_plays, total_time_watched, total_pauses');
    return data || [];
  });