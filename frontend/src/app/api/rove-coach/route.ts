import { NextResponse } from 'next/server';
import { generateRoveCoachPlan } from '@/app/actions/ai-actions';
import { requireAuthenticatedAndRateLimited } from '@/lib/api-auth-guard';

export async function POST(request: Request) {
  try {
    const guard = await requireAuthenticatedAndRateLimited(request, 'rove_coach');
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { phase, energyLevel, goal, equipment, injuries, fitnessLevel, workoutFocus, sessionDuration } = body;

    if (!phase) {
      return NextResponse.json({ error: 'Missing required field: phase' }, { status: 400 });
    }

    const result = await generateRoveCoachPlan(
      phase,
      energyLevel || 'Medium',
      goal || 'General Fitness',
      equipment || 'Bodyweight',
      injuries || 'None',
      fitnessLevel || 'Intermediate',
      workoutFocus || 'Full Body',
      sessionDuration || '30m'
      // progressionPreference, goalFocus, recentOutputSignatures — use the function's own defaults;
      // this branch of ai-actions.ts doesn't yet have the recentChosen/preferenceSummary params
      // that a newer in-progress branch adds, so this route only passes what main's version supports.
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/rove-coach error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
