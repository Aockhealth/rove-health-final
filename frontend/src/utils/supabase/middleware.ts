
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { fetchLifecycleProfile, resolveLifecycleRedirect } from '@/lib/auth/flow-guard'

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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

    const path = request.nextUrl.pathname;

    // 🔥 Fast-path for root to prevent white screen blocking
    if (path === '/') {
        return response;
    }

    const isNonProtectedApi = path.startsWith('/api') && !path.startsWith('/api/protected');
    if (isNonProtectedApi) {
        return response;
    }

    // ✅ FIX: Allow auth callback + reset password flow to bypass middleware
    if (
        path.startsWith('/auth/callback') ||
        path.startsWith('/reset-password')
    ) {
        return response;
    }

    // 🔥 Fast-path for Android container cold start on public auth routes
    const isPublicAuthRoute = path === '/login' || path === '/signup' || path === '/forgot-password';
    const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('-auth-token'));
    if (isPublicAuthRoute && !hasAuthCookie) {
        return response;
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const profile = user ? await fetchLifecycleProfile(supabase, user.id) : null;
    const redirectPath = resolveLifecycleRedirect({
        pathname: path,
        isAuthenticated: Boolean(user),
        profile,
        userId: user?.id ?? null
    });

    if (redirectPath && redirectPath !== path) {
        const url = request.nextUrl.clone()
        url.pathname = redirectPath
        return NextResponse.redirect(url)
    }

    return response
}
