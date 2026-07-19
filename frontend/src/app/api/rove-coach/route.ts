import { NextResponse } from 'next/server';
import { generateRoveCoachPlan } from '@/app/actions/ai-actions';

export async function POST(request: Request) {
  try {
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
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/rove-coach error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
