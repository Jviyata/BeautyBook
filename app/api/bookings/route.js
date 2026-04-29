import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function parseTimeLabel(value) {
  if (!value || value === 'Closed') return null

  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null

  let hours = Number(match[1]) % 12
  const minutes = Number(match[2])
  const meridiem = match[3].toUpperCase()

  if (meridiem === 'PM') hours += 12

  return { hours, minutes }
}

function dateAtTime(baseDate, timeLabel) {
  const parsed = parseTimeLabel(timeLabel)
  if (!parsed) return null

  const value = new Date(baseDate)
  value.setHours(parsed.hours, parsed.minutes, 0, 0)
  return value
}

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

    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: {
        id: true,
        hours: true,
      },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    const bookingDay = DAY_ORDER[bookingDate.getDay()]
    const hoursForDay = professional.hours.find((entry) => entry.day === bookingDay)

    if (!hoursForDay || hoursForDay.open === 'Closed') {
      return NextResponse.json({ error: 'This technician is closed on the selected day' }, { status: 400 })
    }

    const openTime = dateAtTime(bookingDate, hoursForDay.open)
    const closeTime = dateAtTime(bookingDate, hoursForDay.close)

    if (!openTime || !closeTime || bookingDate.getTime() < openTime.getTime() || bookingDate.getTime() > closeTime.getTime()) {
      return NextResponse.json({
        error: `Appointments must be scheduled between ${hoursForDay.open} and ${hoursForDay.close}`,
      }, { status: 400 })
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

// DELETE /api/bookings — cancel a booking
export async function DELETE(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { bookingId } = await req.json()
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
