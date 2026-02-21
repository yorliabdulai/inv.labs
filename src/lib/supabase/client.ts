import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in browser/client components.
 * Uses @supabase/ssr's createBrowserClient which stores the auth session
 * in COOKIES (not just localStorage), allowing server actions to read
 * the session via createServerClient and resolve auth.uid() in RLS policies.
 */
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
