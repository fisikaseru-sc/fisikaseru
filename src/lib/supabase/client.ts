import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder-url")) {
  if (typeof window !== "undefined") {
    // Warning, bukan error: konfigurasi opsional (analytics/auth opsional) —
    // fitur inti lab berjalan lokal tanpa Supabase, dan console.error merah
    // di setiap halaman produksi mengikis kepercayaan guru/siswa (F-05 ronde 2).
    console.warn(
      "⚠️ Supabase environment variables are missing or unconfigured. " +
      "Fitur inti lab tetap berjalan lokal; set NEXT_PUBLIC_SUPABASE_URL dan " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (mis. Vercel Project Settings) untuk mengaktifkan fitur backend."
    );
  }
}

export const supabase = createBrowserClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
