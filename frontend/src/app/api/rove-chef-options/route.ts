import { NextResponse } from 'next/server';
import { generateChefOptions } from '@/app/actions/ai-actions';
import { requireAuthenticatedAndRateLimited } from '@/lib/api-auth-guard';

export async function POST(request: Request) {
  try {
    const guard = await requireAuthenticatedAndRateLimited(request, 'rove_chef_options');
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { phase, mealType, dietary_preferences, cuisine, symptoms, recentChosen, recentShown, preferenceSummary, fitnessGoal } = body;

    if (!phase) {
      return NextResponse.json({ error: 'Missing required field: phase' }, { status: 400 });
    }
    if (!['snack', 'smoothie', 'salad'].includes(mealType)) {
      return NextResponse.json({ error: 'Invalid mealType' }, { status: 400 });
    }

    const result = await generateChefOptions({
      phase,
      mealType,
      dietary_preferences,
      cuisine,
      symptoms,
      recentChosen,
      recentShown,
      preferenceSummary,
      fitnessGoal,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/rove-chef-options error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
