import { NextResponse } from 'next/server';
import { generateChefDetail } from '@/app/actions/ai-actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dishName, mealType, phase, dietary_preferences, keyIngredients } = body;

    if (!dishName || !phase) {
      return NextResponse.json({ error: 'Missing required fields: dishName, phase' }, { status: 400 });
    }
    if (!['snack', 'smoothie', 'salad'].includes(mealType)) {
      return NextResponse.json({ error: 'Invalid mealType' }, { status: 400 });
    }

    const result = await generateChefDetail({
      dishName,
      mealType,
      phase,
      dietary_preferences,
      keyIngredients,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/rove-chef-detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
