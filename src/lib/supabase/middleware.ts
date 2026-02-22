import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase SSR session refresh for Next.js Middleware.
 * 
 * Follows the exact Supabase-recommended pattern:
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 * 
 * Key rules:
 * 1. Use createServerClient with the request/response cookie adapters.
 * 2. ALWAYS call getUser() — never getSession() — to validate the token server-side.
 * 3. Pass any cookie mutations onto both the request (for downstream Server Components)
 *    and the response (for the browser).
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
                    // Write cookies onto the forwarded request headers so that
                    // Server Components downstream see the refreshed session.
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    // Re-create the response now that request cookies are updated.
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    // Write cookies onto the response so the browser stores them.
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do not run any logic between createServerClient and getUser().
    // A simple mistake could make it very hard to debug issues with users being
    // randomly logged out.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Protect /dashboard — redirect unauthenticated users to /login
    if (!user && pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        // Carry over any cookies (e.g. refreshed tokens) the Supabase client set.
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirectResponse
    }

    // Redirect authenticated users away from auth pages
    const isAuthPage =
        pathname.startsWith('/login') ||
        pathname.startsWith('/register')

    if (user && isAuthPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirectResponse
    }

    // IMPORTANT: return supabaseResponse (not a new NextResponse) so that the
    // refreshed session cookies are forwarded to the browser.
    return supabaseResponse
}
