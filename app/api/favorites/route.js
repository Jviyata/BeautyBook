import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/favorites — list user's saved pros
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        professional: {
          include: { hours: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(favorites.map((f) => ({ ...f.professional, pinned: f.pinned })))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

  // PATCH /api/favorites — toggle pin on an existing favorite
  export async function PATCH(req) {
    try {
      const session = await getSession()
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { professionalId } = await req.json()
      if (!professionalId) return NextResponse.json({ error: 'Missing professionalId' }, { status: 400 })

      const existing = await prisma.favorite.findUnique({
        where: { userId_professionalId: { userId: session.user.id, professionalId } },
      })
      if (!existing) return NextResponse.json({ error: 'Not saved' }, { status: 404 })

      const updated = await prisma.favorite.update({
        where: { id: existing.id },
        data: { pinned: !existing.pinned },
      })
      return NextResponse.json({ pinned: updated.pinned })
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
  }

// POST /api/favorites — toggle favorite
export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { professionalId } = await req.json()
    if (!professionalId) return NextResponse.json({ error: 'Missing professionalId' }, { status: 400 })

    const existing = await prisma.favorite.findUnique({
      where: { userId_professionalId: { userId: session.user.id, professionalId } },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    } else {
      await prisma.favorite.create({ data: { userId: session.user.id, professionalId } })
      return NextResponse.json({ favorited: true })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
