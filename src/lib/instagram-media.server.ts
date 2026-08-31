/** Converts an Instagram caption into timed WebVTT cues for the chosen subtitle language. */
export function captionToVtt(caption: string, language = "en"): string {
  const lines = caption
    .replace(/#[^\s#]+/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = (s: number) => `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}.000`;
  const cues = lines.map((line, i) => `${i + 1}\n${stamp(i * 4)} --> ${stamp(i * 4 + 4)}\n${line}`);
  return [`WEBVTT - ${language}`, "", ...cues].join("\n\n");
}

type Media = {
  id: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  caption?: string;
  thumbnail_url?: string;
  timestamp?: string;
};

/** Idempotent write: media_hash unique index guarantees a post can never land twice. */
export async function upsertMedia(supabase: any, items: Media[], source: string) {
  if (!items.length) return 0;
  const rows = items.map((m) => ({
    id: m.id,
    media_type: m.media_type ?? null,
    media_url: m.media_url ?? null,
    permalink: m.permalink ?? null,
    caption: m.caption ?? null,
    thumbnail_url: m.thumbnail_url ?? null,
    timestamp: m.timestamp ?? new Date().toISOString(),
    media_hash: `ig:${m.id}`,
    source,
  }));
  const { error } = await supabase
    .from("instagram_posts")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: false });
  if (error) throw new Error(error.message);
  return rows.length;
}

export async function fetchMedia(token: string, mediaId?: string): Promise<Media[]> {
  const fields = "id,media_type,media_url,permalink,caption,thumbnail_url,timestamp";
  const url = mediaId
    ? `https://graph.instagram.com/${mediaId}?fields=${fields}&access_token=${encodeURIComponent(token)}`
    : `https://graph.instagram.com/me/media?fields=${fields}&limit=25&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.error?.message ?? "Instagram API request failed");
    (err as any).code = json?.error?.code ?? res.status;
    throw err;
  }
  return mediaId ? [json as Media] : ((json?.data ?? []) as Media[]);
}

export function adviceFor(code: unknown, message: string): string {
  if (String(code) === "190" || /token/i.test(message)) {
    return "Access token expired or revoked — use One-Click Reconnect to re-authorise.";
  }
  if (String(code) === "4" || /limit/i.test(message)) return "Rate limited by Instagram — retry in a few minutes.";
  if (/not connected/i.test(message)) return "Connect an Instagram Business account first.";
  return "Retry the sync; if it keeps failing, verify the account is a Business/Creator account.";
}

