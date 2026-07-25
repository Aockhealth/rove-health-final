import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { aiRateLimiter } from '@/lib/rate-limiter';

// Same auth + rate-limit pattern already used by /api/chat and /api/ai-chat —
// extracted here since 5 other AI routes (rove-chef*, rove-coach, rove-insight)
// had neither, leaving them open to unauthenticated, unlimited AI-cost abuse.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_COUNT = 20; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // per minute

type GuardResult = { ok: true; userId: string } | { ok: false; response: NextResponse };

export async function requireAuthenticatedAndRateLimited(request: Request, routeKey: string): Promise<GuardResult> {
  const supabase = await createClient();

  // The website sends its session via cookies (createClient() reads those
  // automatically), but the mobile app has no cookie jar — it sends its
  // Supabase access token as a Bearer header instead. getUser(jwt) verifies
  // an explicit token the same way regardless of cookie state, so both
  // callers work through the same guard.
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  const { data: { user }, error: authError } = await supabase.auth.getUser(bearerToken);

  if (authError || !user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const limitKey = `${routeKey}_${user.id}`;

  if (aiRateLimiter) {
    const { success } = await aiRateLimiter.limit(limitKey);
    if (!success) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Rate limit exceeded. Please try again in a minute.' }, { status: 429 }),
      };
    }
  } else {
    // Local in-memory fallback for dev environments without Upstash configured.
    const now = Date.now();
    const userLimit = rateLimitMap.get(limitKey) || { count: 0, lastReset: now };
    if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
      userLimit.count = 1;
      userLimit.lastReset = now;
    } else {
      userLimit.count++;
    }
    rateLimitMap.set(limitKey, userLimit);
    if (userLimit.count > RATE_LIMIT_COUNT) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Rate limit exceeded. Please try again in a minute.' }, { status: 429 }),
      };
    }
  }

  return { ok: true, userId: user.id };
}
