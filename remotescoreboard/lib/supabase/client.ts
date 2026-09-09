import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jpbrgkpydlevbgpdswbh.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_5LyQ4NLzbN5KrDPsBSalLg_9vbXkjks"
  );
}
