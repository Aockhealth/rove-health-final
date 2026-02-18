
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
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
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // ⚡ OPTIMIZATION: Only check auth on protected routes
    // Public routes: /, /login, /signup, /auth/*, /about, /blog, etc.
    // Protected routes: /cycle-sync, /onboarding, /api/protected
    const path = request.nextUrl.pathname;
    const isProtectedRoute = path.startsWith('/cycle-sync') ||
        path.startsWith('/onboarding') ||
        path.startsWith('/api/protected');

    if (isProtectedRoute) {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return response
}
