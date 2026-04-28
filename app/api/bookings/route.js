import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/bookings — list current user's bookings
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { professional: { select: { id: true, name: true, city: true } } },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(bookings)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/bookings — create a booking
export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { professionalId, date, notes } = await req.json()
    if (!professionalId || !date) {
      return NextResponse.json({ error: 'Missing professionalId or date' }, { status: 400 })
    }

    const bookingDate = new Date(date)
    if (Number.isNaN(bookingDate.getTime())) {
      return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 })
    }

    if (bookingDate.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Appointments cannot be scheduled in the past' }, { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        professionalId,
        date: bookingDate,
        notes: notes || null,
        status: 'pending',
      },
      include: { professional: { select: { id: true, name: true, city: true } } },
    })
    return NextResponse.json(booking, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
