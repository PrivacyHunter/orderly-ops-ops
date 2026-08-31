import type { SupabaseClient } from "@supabase/supabase-js";

type DB = SupabaseClient<any>;

export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  details: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

export type CertificateInput = {
  id?: string | undefined;
  title: string;
  issuer: string;
  issue_date: string;
  details: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

const COLUMNS = "id, title, issuer, issue_date, details, image_url, sort_order, is_active";

export async function fetchAllCertificates(supabase: DB) {
  const { data, error } = await supabase
    .from("certificates")
    .select(COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Certificate[];
}

export async function saveCertificate(supabase: DB, input: CertificateInput) {
  const row = { ...input, updated_at: new Date().toISOString() };
  if (!row.id) delete (row as any).id;
  const { data, error } = await supabase.from("certificates").upsert(row as any).select("id").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function removeCertificate(supabase: DB, id: string) {
  const { error } = await supabase.from("certificates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Public, anon-readable certificates for the live site. */
export async function fetchPublicCertificates(): Promise<Certificate[]> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return [];
  const client: DB = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await client
    .from("certificates")
    .select(COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as Certificate[];
}
