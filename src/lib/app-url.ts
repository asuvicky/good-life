export function appBaseUrl() {
  const configured = (process.env.APP_BASE_URL || "").replace(/\/$/, "");
  if (configured) return configured;
  const vercel = (process.env.VERCEL_URL || "").replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return "";
}
