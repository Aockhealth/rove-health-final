import type { NextRequest } from 'next/server'
import { fetchLearnArticles } from '@backend/actions/cycle-sync/learn/learn-actions'

export async function GET(_req: NextRequest) {
  try {
    const articles = await fetchLearnArticles()
    return new Response(JSON.stringify(articles ?? []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('API /api/learn error:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
