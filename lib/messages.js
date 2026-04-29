import { prisma } from '@/lib/prisma'

export async function getProfessionalForTechSession(session) {
  if (session?.user?.role !== 'TECH' || !session?.user?.email) return null

  return prisma.professional.findFirst({
    where: {
      email: {
        equals: session.user.email.trim().toLowerCase(),
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      state: true,
    },
  })
}

export function formatConversation(conversation, viewerRole) {
  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastMessageAt: conversation.lastMessageAt,
    professional: conversation.professional
      ? {
          id: conversation.professional.id,
          name: conversation.professional.name,
          city: conversation.professional.city,
          state: conversation.professional.state,
        }
      : null,
    user: conversation.user
      ? {
          id: conversation.user.id,
          name: conversation.user.name,
          email: conversation.user.email,
        }
      : null,
    messages: (conversation.messages || []).map((message) => ({
      id: message.id,
      body: message.body,
      senderType: message.senderType,
      createdAt: message.createdAt,
      mine: message.senderType === viewerRole,
    })),
    lastMessage: conversation.messages?.[conversation.messages.length - 1]
      ? {
          id: conversation.messages[conversation.messages.length - 1].id,
          body: conversation.messages[conversation.messages.length - 1].body,
          senderType: conversation.messages[conversation.messages.length - 1].senderType,
          createdAt: conversation.messages[conversation.messages.length - 1].createdAt,
        }
      : null,
  }
}
