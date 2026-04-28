import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { professionalId, rating, comment } = await req.json()

    if (!professionalId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const review = await prisma.review.upsert({
      where: { userId_professionalId: { userId: session.user.id, professionalId } },
      update: { rating, comment },
      create: { userId: session.user.id, professionalId, rating, comment },
      include: { user: { select: { name: true, image: true } } },
    })

    // Recalculate average rating
    const agg = await prisma.review.aggregate({
      where: { professionalId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await prisma.professional.update({
      where: { id: professionalId },
      data: {
        avgRating: Math.round((agg._avg.rating || 0) * 10) / 10,
        reviewCount: agg._count.rating,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

  // GET /api/reviews?mine=1 — current user's reviews
  export async function GET(req) {
    try {
      const session = await getSession()
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const reviews = await prisma.review.findMany({
        where: { userId: session.user.id },
        include: { professional: { select: { id: true, name: true, city: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(reviews)
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
  }
