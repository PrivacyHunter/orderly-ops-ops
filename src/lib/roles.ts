export type AppRole = "owner" | "admin" | "developer" | "user";

export const STAFF_ROLES: AppRole[] = ["owner", "admin", "developer"];

export function isStaff(role: AppRole | null | undefined) {
  return !!role && STAFF_ROLES.includes(role);
}

/** Developer is the highest tier: system, roles and logs. */
export function canSeeSystem(role: AppRole | null | undefined) {
  return role === "developer";
}
