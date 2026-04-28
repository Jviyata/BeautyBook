import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const city = searchParams.get('city') || ''
    const services = searchParams.get('services')?.split(',').filter(Boolean) || []
    const style = searchParams.get('style') || ''
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const maxPrice = parseInt(searchParams.get('maxPrice') || '9999')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10

    const where = {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } },
                { services: { hasSome: [query] } },
              ],
            }
          : {},
        city ? { city: { contains: city, mode: 'insensitive' } } : {},
        services.length > 0 ? { services: { hasSome: services } } : {},
        style
          ? {
              OR: [
                { bio: { contains: style, mode: 'insensitive' } },
                { name: { contains: style, mode: 'insensitive' } },
              ],
            }
          : {},
        minRating > 0 ? { avgRating: { gte: minRating } } : {},
        { priceMin: { lte: maxPrice } },
      ],
    }

    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { avgRating: 'desc' },
        include: { hours: true },
      }),
      prisma.professional.count({ where }),
    ])

    return NextResponse.json({ professionals, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
