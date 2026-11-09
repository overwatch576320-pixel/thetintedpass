import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;

export const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "hello@thetintedpass.com";
export const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210").replace(/\D/g, "");

export function whatsappLink(message = "Hello, I would like to know more about The Tinted Pass journeys.") {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
