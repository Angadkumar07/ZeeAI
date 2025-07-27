import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing PERPLEXITY_API_KEY' }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { messages, model = 'sonar-pro', ...rest } = body;
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Missing or invalid messages array' }, { status: 400 });
  }

  try {
    const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, model, ...rest }),
    });

    const data = await perplexityRes.json();
    if (!perplexityRes.ok) {
      return NextResponse.json({ error: data.error || 'Perplexity API error' }, { status: perplexityRes.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to contact Perplexity API' }, { status: 502 });
  }
} 