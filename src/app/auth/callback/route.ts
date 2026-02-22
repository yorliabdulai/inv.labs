import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Auth Callback Route Handler (PKCE OAuth flow).
 *
 * This handler receives the `code` from Supabase after a successful OAuth
 * redirect and exchanges it for a user session. Session cookies are written
 * to the response here so the browser stores them before the redirect to
 * /dashboard fires.
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=missing_code`)
    }

    const cookieStore = await cookies()

    // Collect all cookies set during the exchange so we can write them onto
    // the redirect response returned to the browser.
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(incoming) {
                    // Buffer them — do NOT try to call cookieStore.set() here because
                    // Route Handlers treat the cookie store as read-only.
                    incoming.forEach(({ name, value, options }) => {
                        cookiesToSet.push({ name, value, options: options ?? {} })
                    })
                },
            },
        }
    )

    // Perform the PKCE code → session exchange.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.session) {
        console.error('[Auth Callback] Code exchange failed:', error?.message)
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }

    console.log('[Auth Callback] Exchange success for:', data.user?.email)

    // Build the redirect response AFTER a successful exchange.
    const redirectUrl = new URL(next, origin)
    const response = NextResponse.redirect(redirectUrl)

    // Write every session cookie onto the response so the browser stores them
    // before the redirect to /dashboard lands.
    const isLocal = origin.startsWith('http://')
    cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
            ...options,
            // Never mark cookies as Secure in local dev (http://) — the browser
            // will silently drop Secure cookies on non-https origins.
            secure: isLocal ? false : (options.secure as boolean | undefined),
            // Strip domain so cookies are scoped to the current host only.
            // This prevents conflicts when running multiple Supabase projects locally.
            domain: isLocal ? undefined : (options.domain as string | undefined),
            sameSite: 'lax',
            path: '/',
        })
    })

    return response
}
