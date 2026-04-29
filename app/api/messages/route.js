import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatConversation, getProfessionalForTechSession } from '@/lib/messages'

export const dynamic = 'force-dynamic'

function conversationInclude(includeAllMessages = false) {
  return {
    professional: {
      select: { id: true, name: true, city: true, state: true },
    },
    user: {
      select: { id: true, name: true, email: true },
    },
    messages: includeAllMessages
      ? {
          orderBy: { createdAt: 'asc' },
        }
      : {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
  }
}

export async function GET(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const professionalId = searchParams.get('professionalId')

    if (session.user.role === 'TECH') {
      const professional = await getProfessionalForTechSession(session)
      if (!professional) {
        return NextResponse.json({ conversations: [], professionalLinked: false })
      }

      const conversations = await prisma.conversation.findMany({
        where: { professionalId: professional.id },
        orderBy: { lastMessageAt: 'desc' },
        include: conversationInclude(true),
      })

      return NextResponse.json({
        conversations: conversations.map((conversation) => formatConversation(conversation, 'TECH')),
        professionalLinked: true,
        professional,
      })
    }

    if (professionalId) {
      const conversation = await prisma.conversation.findUnique({
        where: {
          userId_professionalId: {
            userId: session.user.id,
            professionalId,
          },
        },
        include: conversationInclude(true),
      })

      return NextResponse.json({
        conversation: conversation ? formatConversation(conversation, 'USER') : null,
      })
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { lastMessageAt: 'desc' },
      include: conversationInclude(true),
    })

    return NextResponse.json({
      conversations: conversations.map((conversation) => formatConversation(conversation, 'USER')),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Only users can start a conversation here' }, { status: 403 })
    }

    const { professionalId, body } = await req.json()
    if (!professionalId || !body?.trim()) {
      return NextResponse.json({ error: 'Missing professionalId or message body' }, { status: 400 })
    }

    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { id: true },
    })
    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    const now = new Date()
    const conversation = await prisma.conversation.upsert({
      where: {
        userId_professionalId: {
          userId: session.user.id,
          professionalId,
        },
      },
      update: {
        lastMessageAt: now,
      },
      create: {
        userId: session.user.id,
        professionalId,
        lastMessageAt: now,
      },
    })

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        body: body.trim(),
        senderType: 'USER',
      },
    })

    const refreshedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: conversationInclude(true),
    })

    return NextResponse.json(
      { conversation: formatConversation(refreshedConversation, 'USER') },
      { status: 201 },
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
