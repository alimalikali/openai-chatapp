import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      )
    }

    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    })

    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) { controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))}
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    )
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from OpenAI' },
      { status: 500 }
    )
  }
}
