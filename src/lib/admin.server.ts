import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { AppRole } from "./roles";

type DB = SupabaseClient<Database>;

/** Highest role held by the user, resolved through RLS-scoped client. */
export async function resolveRole(supabase: DB, userId: string): Promise<AppRole> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as AppRole);
  if (roles.includes("developer")) return "developer";
  if (roles.includes("owner")) return "owner";
  if (roles.includes("admin")) return "admin";
  return "user";
}

export async function assertStaff(supabase: DB, userId: string): Promise<AppRole> {
  const role = await resolveRole(supabase, userId);
  if (role === "user") throw new Error("Forbidden: staff access required");
  return role;
}

export async function assertDeveloper(supabase: DB, userId: string): Promise<AppRole> {
  const role = await resolveRole(supabase, userId);
  if (role !== "developer") throw new Error("Forbidden: developer access required");
  return role;
}

/** Owners and developers may manage staff accounts and admin rights. */
export async function assertRoleManager(supabase: DB, userId: string): Promise<AppRole> {
  const role = await resolveRole(supabase, userId);
  if (role !== "owner" && role !== "developer") {
    throw new Error("Forbidden: owner or developer access required");
  }
  return role;
}

/** Sections an admin can be granted access to. Owners/developers always have all. */
export const ADMIN_PERMISSIONS = [
  "inbox",
  "products",
  "theme",
  "branding",
  "seo",
  "customization",
  "visitors",
  "analytics",
  "instagram",
  "content",
  "settings",
  "banners",
  "certificates",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

/** Permissions for a single user (owners/developers implicitly hold all). */
export async function listPermissions(
  supabase: DB,
  userId: string,
  role: AppRole,
): Promise<string[]> {
  if (role === "owner" || role === "developer") return [...ADMIN_PERMISSIONS];
  if (role !== "admin") return [];
  const { data } = await supabase
    .from("admin_permissions" as any)
    .select("permission")
    .eq("user_id", userId);
  return ((data ?? []) as unknown as { permission: string }[]).map((r) => r.permission);
}

/** Permission map for every staff account, used by the accounts manager. */
export async function listPermissionMap(supabase: DB): Promise<Record<string, string[]>> {
  const { data } = await supabase
    .from("admin_permissions" as any)
    .select("user_id, permission");
  const map: Record<string, string[]> = {};
  for (const row of (data ?? []) as unknown as { user_id: string; permission: string }[]) {
    (map[row.user_id] ??= []).push(row.permission);
  }
  return map;
}

export type StaffUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
};

/**
 * Owners/admins never receive developer accounts — they are invisible to them.
 */
export async function listAccounts(supabase: DB, callerRole: AppRole): Promise<StaffUser[]> {
  const [{ data: profiles }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name"),
    supabase.from("user_roles").select("user_id, role"),
  ]);

  const roleMap = new Map<string, AppRole[]>();
  for (const row of roleRows ?? []) {
    const list = roleMap.get(row.user_id) ?? [];
    list.push(row.role as AppRole);
    roleMap.set(row.user_id, list);
  }

  const highest = (roles: AppRole[]): AppRole =>
    roles.includes("developer")
      ? "developer"
      : roles.includes("owner")
        ? "owner"
        : roles.includes("admin")
          ? "admin"
          : "user";

  return (profiles ?? [])
    .map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: highest(roleMap.get(p.id) ?? []),
    }))
    // Strict developer masking: Developers are completely invisible to non-developers.
    .filter((u) => (callerRole === "developer" ? true : u.role !== "developer"));
}
