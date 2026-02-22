import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase SSR session helper for Next.js 16 Proxy.
 *
 * Follows the official Supabase + Next.js 16 recommended pattern.
 * Uses getClaims() — NOT getUser() — because:
 *   - getClaims() validates the JWT locally (fast, no network call)
 *   - getUser() makes a network round-trip to Supabase on every request
 *   - getClaims() correctly handles session refresh needed by the Proxy
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Step 1: Write refreshed tokens into the forwarded request headers
                    // so Server Components downstream see the updated session.
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    // Step 2: Re-create the response with the mutated request so
                    // cookies are forwarded correctly.
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    // Step 3: Write refreshed tokens into the response so the
                    // browser stores the updated session cookies.
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do not add any logic between createServerClient and getClaims().
    // getClaims() validates the JWT signature against Supabase's public keys and
    // triggers a token refresh if expired. If it's called after other logic, the
    // cookie updates from the refresh may not propagate correctly.
    const { data: claimsData } = await supabase.auth.getClaims()

    // A user is authenticated if there are valid claims present.
    const isAuthenticated = !!claimsData?.claims

    const pathname = request.nextUrl.pathname

    // Protect /dashboard — redirect unauthenticated users to /login
    if (!isAuthenticated && pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        // Forward any refreshed session cookies onto the redirect so they
        // are not lost when the browser follows the redirect.
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirectResponse
    }

    // Redirect authenticated users away from auth pages
    const isAuthPage =
        pathname.startsWith('/login') ||
        pathname.startsWith('/register')

    if (isAuthenticated && isAuthPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirectResponse
    }

    // IMPORTANT: return supabaseResponse (not a new NextResponse.next()) so
    // that the refreshed session cookies are propagated to the browser.
    return supabaseResponse
}
