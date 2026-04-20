import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req, { params }) {
  try {
    const session = await getSession()

    const pro = await prisma.professional.findUnique({
      where: { id: params.id },
      include: {
        hours: { orderBy: { day: 'asc' } },
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!pro) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let isFavorited = false
    if (session?.user?.id) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_professionalId: { userId: session.user.id, professionalId: params.id } },
      })
      isFavorited = !!fav
    }

    return NextResponse.json({ ...pro, isFavorited })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
