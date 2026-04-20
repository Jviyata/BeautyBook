import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { message, city } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    // Fetch available professionals as context
    const pros = await prisma.professional.findMany({
      select: { id: true, name: true, city: true, services: true, priceMin: true, priceMax: true, avgRating: true },
      take: 50,
    })

    const prosContext = pros
      .map(
        (p) =>
          `- ${p.name} in ${p.city}: services: ${p.services.join(', ')}, price: $${p.priceMin}-$${p.priceMax}, rating: ${p.avgRating || 'N/A'}/5`
      )
      .join('\n')

    const systemPrompt = `You are BeautyBot, a friendly assistant for Beauty Book — an app to discover local beauty professionals.
    
Available professionals in our database:
${prosContext}

When a user describes what they're looking for (service, style, budget, location), recommend 2-3 relevant professionals from the list above.
Be conversational, warm, and helpful. Always mention the professional's name, services, and price range.
If you recommend someone, format their name in **bold**. Keep responses concise (under 150 words).`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!response.ok) throw new Error('AI request failed')

    const data = await response.json()
    const reply = data.content?.[0]?.text || 'Sorry, I could not process that request.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
