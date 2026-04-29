import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatConversation, getProfessionalForTechSession } from '@/lib/messages'

export const dynamic = 'force-dynamic'

const CONVERSATION_INCLUDE = {
  professional: {
    select: { id: true, name: true, city: true, state: true },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
  messages: {
    orderBy: { createdAt: 'asc' },
  },
}

async function loadAuthorizedConversation(session, conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: CONVERSATION_INCLUDE,
  })

  if (!conversation) return { error: 'Conversation not found', status: 404 }

  if (session.user.role === 'TECH') {
    const professional = await getProfessionalForTechSession(session)
    if (!professional) {
      return { error: 'No technician profile is linked to this account', status: 404 }
    }

    if (conversation.professionalId !== professional.id) {
      return { error: 'Forbidden', status: 403 }
    }

    return { conversation, viewerRole: 'TECH' }
  }

  if (conversation.userId !== session.user.id) {
    return { error: 'Forbidden', status: 403 }
  }

  return { conversation, viewerRole: 'USER' }
}

export async function GET(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await loadAuthorizedConversation(session, params.conversationId)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      conversation: formatConversation(result.conversation, result.viewerRole),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { body } = await req.json()
    if (!body?.trim()) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }

    const result = await loadAuthorizedConversation(session, params.conversationId)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const senderType = result.viewerRole

    await prisma.message.create({
      data: {
        conversationId: result.conversation.id,
        body: body.trim(),
        senderType,
      },
    })

    await prisma.conversation.update({
      where: { id: result.conversation.id },
      data: { lastMessageAt: new Date() },
    })

    const refreshedConversation = await prisma.conversation.findUnique({
      where: { id: result.conversation.id },
      include: CONVERSATION_INCLUDE,
    })

    return NextResponse.json({
      conversation: formatConversation(refreshedConversation, senderType),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
