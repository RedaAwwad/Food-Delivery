/** API base URL. On Netlify set VITE_API_URL to your hosted backend (e.g. https://api.example.com/api/v1). */
export function getApiBase(): string {
  const url = import.meta.env.VITE_API_URL;
  if (url && typeof url === "string") {
    return url.replace(/\/$/, "");
  }
  return "/api/v1";
}
