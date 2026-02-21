import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for server-side use (Server Actions, Route Handlers).
 * Uses @supabase/ssr to properly read and write chunked auth cookies so
 * auth.uid() resolves correctly in RLS policies.
 */
export async function createServerClient() {
    const cookieStore = await cookies();

    return createSSRClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // In Server Components cookies() is read-only — ignore write errors
                    }
                },
            },
        }
    );
}
