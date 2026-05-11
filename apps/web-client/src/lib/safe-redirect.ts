/**
 * Validate that a redirect target is a safe in-app path.
 * Rejects external URLs, protocol-relative URLs, and javascript: schemes
 * to prevent open-redirect phishing.
 */
export function safeRedirect(raw: string | null | undefined, fallback = "/me"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  // Only allow paths starting with /
  if (!trimmed.startsWith("/")) return fallback;
  // Reject protocol-relative URLs (//evil.com)
  if (trimmed.startsWith("//")) return fallback;
  // Reject paths that contain : (javascript:, data:, etc.)
  if (trimmed.includes(":")) return fallback;
  return trimmed;
}
