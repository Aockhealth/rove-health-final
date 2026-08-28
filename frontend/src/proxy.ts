import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rovehealth.app'

export async function proxy(request: NextRequest) {
  // Single QR-friendly link: Android goes straight to the Play Store,
  // everyone else (iOS, desktop) lands on /app, where iOS can join the waitlist.
  // A true HTTP redirect here (not a page-level one) so QR scanners that
  // don't run JS still land in the right place.
  if (request.nextUrl.pathname === '/get') {
    const userAgent = request.headers.get('user-agent') ?? ''
    const isAndroid = /Android/i.test(userAgent)
    const destination = isAndroid ? PLAY_STORE_URL : new URL('/app', request.url).toString()
    return NextResponse.redirect(destination, 307)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)',
  ],
}
