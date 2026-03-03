export function isAdmin(user: { role?: "customer" | "admin" } | null | undefined) {
  return user?.role === "admin";
}
