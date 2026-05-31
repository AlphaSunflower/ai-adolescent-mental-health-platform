export function safeRedirect(raw: string | null | undefined, fallback = "/admin/dashboard"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes(":")) return fallback;
  return trimmed;
}
