import { NextResponse } from 'next/server';
import { generateMoodInsight } from '@/app/actions/ai-actions';
import { requireAuthenticatedAndRateLimited } from '@/lib/api-auth-guard';

export async function POST(request: Request) {
  try {
    const guard = await requireAuthenticatedAndRateLimited(request, 'rove_insight');
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { phase, moodCounts } = body;

    if (!phase) {
      return NextResponse.json({ error: 'Missing required field: phase' }, { status: 400 });
    }

    const result = await generateMoodInsight(phase, moodCounts || {});

    if (!result) {
      return NextResponse.json({ insight: null });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/rove-insight error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
