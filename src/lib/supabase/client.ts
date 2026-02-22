import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-Side Supabase Client.
 * 
 * Used EXCLUSIVELY in 'use client' components.
 * Singleton instance is returned to maintain efficiency.
 */
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Factory for creating a browser client (for consistency with server factory).
 */
export function createClient() {
    return supabase;
}

// Compatibility Alias
export const createBrowserClientFactory = createClient;
