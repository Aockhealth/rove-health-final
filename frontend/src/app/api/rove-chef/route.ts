import { NextResponse } from 'next/server';
import { generateRoveChefProtocol } from '@/app/actions/ai-actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phase, dietary_preferences, cuisine, type, personalization } = body;
    
    if (!phase) {
      return NextResponse.json({ error: 'Missing required field: phase' }, { status: 400 });
    }
    
    const result = await generateRoveChefProtocol(
      phase,
      dietary_preferences || 'None',
      cuisine || 'Global',
      type,
      personalization || {}
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/rove-chef error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
