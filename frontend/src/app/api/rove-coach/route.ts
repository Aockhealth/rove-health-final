import { NextResponse } from 'next/server';
import { generateRoveCoachPlan } from '@/app/actions/ai-actions';
import { requireAuthenticatedAndRateLimited } from '@/lib/api-auth-guard';

export async function POST(request: Request) {
  try {
    const guard = await requireAuthenticatedAndRateLimited(request, 'rove_coach');
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { phase, energyLevel, goal, equipment, injuries, fitnessLevel, workoutFocus, sessionDuration, recentChosen, preferenceSummary } = body;

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
      sessionDuration || '30m',
      undefined, // progressionPreference — use the function's own default
      undefined, // goalFocus — use the function's own default
      undefined, // recentOutputSignatures — use the function's own default
      recentChosen,
      preferenceSummary
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/rove-coach error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
