import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// WHY THIS FILE WORKS THIS WAY
// ---------------------------------------------------------------------------
// @supabase/ssr's createServerClient writes session cookies via an
// `onAuthStateChange` listener that is **async**. In a Next.js Route Handler,
// the function returns before that listener fires, so setAll() is never called
// and no session cookies are written to the response.
//
// Solution: We use createServerClient only to perform exchangeCodeForSession
// (because it handles the PKCE verifier lookup from the cookie jar). Then we
// take the session from the return value and write the SSR-compatible cookies
// to the response manually — bypassing the async event system entirely.
// ---------------------------------------------------------------------------

/** Project ref from NEXT_PUBLIC_SUPABASE_URL, e.g. "scjjifscnnshkvqxnkzp" */
function getProjectRef(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    return url.split('//')[1]?.split('.')[0] ?? ''
}

/** base64url-encodes a UTF-8 string (no padding). */
function toBase64url(s: string): string {
    return Buffer.from(s, 'utf8').toString('base64url')
}

/** Mirrors @supabase/ssr's createChunks — splits at 3180 URL-encoded bytes. */
const MAX_CHUNK = 3180
function createChunks(key: string, value: string): { name: string; value: string }[] {
    const enc = encodeURIComponent(value)
    if (enc.length <= MAX_CHUNK) return [{ name: key, value }]
    const chunks: string[] = []
    let rem = enc
    while (rem.length > 0) {
        let head = rem.slice(0, MAX_CHUNK)
        const last = head.lastIndexOf('%')
        if (last > MAX_CHUNK - 3) head = head.slice(0, last)
        chunks.push(decodeURIComponent(head))
        rem = rem.slice(head.length)
    }
    return chunks.map((v, i) => ({ name: `${key}.${i}`, value: v }))
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=missing_code`)
    }

    const cookieStore = await cookies()

    // Create the SSR client. We don't need setAll to work here — we just need
    // getAll so that exchangeCodeForSession can find the PKCE verifier cookie.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => {
                    // Intentionally left empty — we write cookies manually below.
                    // The async onAuthStateChange path that normally calls this
                    // fires AFTER the Route Handler returns, so it's useless here.
                },
            },
        }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.session) {
        console.error('[Auth Callback] Exchange failed:', error?.message)
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }

    console.log('[Auth Callback] Exchange success for:', data.user?.email)

    // Encode the session in the format @supabase/ssr expects:
    // base64-<base64url(JSON.stringify(session))>
    const projectRef = getProjectRef()
    const cookieKey = `sb-${projectRef}-auth-token`
    const verifierKey = `sb-${projectRef}-auth-token-code-verifier`

    const sessionValue = 'base64-' + toBase64url(JSON.stringify(data.session))
    const sessionChunks = createChunks(cookieKey, sessionValue)

    const isLocal = origin.startsWith('http://')
    const sessionOpts = {
        path: '/',
        sameSite: 'lax' as const,
        httpOnly: false,
        secure: !isLocal,
        maxAge: 400 * 24 * 60 * 60, // 400 days — matches @supabase/ssr DEFAULT_COOKIE_OPTIONS
    }

    const response = NextResponse.redirect(new URL(next, origin))

    // Write session cookie chunks onto the response so the browser stores them.
    sessionChunks.forEach(({ name, value }) => {
        response.cookies.set(name, value, sessionOpts)
    })

    // Expire the PKCE verifier cookie — it's single-use.
    response.cookies.set(verifierKey, '', { path: '/', maxAge: 0, sameSite: 'lax', secure: !isLocal })

    console.log('[Auth Callback] Session cookies written:', sessionChunks.map(c => c.name).join(', '))
    return response
}
