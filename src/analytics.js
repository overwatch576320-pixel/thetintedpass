import { supabase } from "./lib";

function getCountry() {
  // Country is intentionally not guessed from IP. With a consented analytics provider,
  // add a country field server-side. This starter records an unknown value by default.
  return "Unknown";
}

export async function trackPageView(path) {
  const event = {
    path,
    country: getCountry(),
    referrer: document.referrer || null,
    user_agent: navigator.userAgent
  };

  // Local fallback is only visible in this browser and is not cross-visitor analytics.
  const local = JSON.parse(localStorage.getItem("ttp_local_views") || "[]");
  local.push({ ...event, created_at: new Date().toISOString() });
  localStorage.setItem("ttp_local_views", JSON.stringify(local.slice(-500)));

  if (supabase) {
    await supabase.from("page_views").insert({
      path: event.path,
      country: event.country,
      referrer: event.referrer
    });
  }
}
