const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const CORE_SERVICES = ['Nails', 'Hair', 'Lashes', 'Brows', 'Makeup', 'Tan']

const HOURS_TEMPLATE = [
  { day: 'Monday', open: '9:00 AM', close: '6:00 PM' },
  { day: 'Tuesday', open: '9:00 AM', close: '6:00 PM' },
  { day: 'Wednesday', open: '9:00 AM', close: '7:00 PM' },
  { day: 'Thursday', open: '9:00 AM', close: '7:00 PM' },
  { day: 'Friday', open: '9:00 AM', close: '8:00 PM' },
  { day: 'Saturday', open: '10:00 AM', close: '5:00 PM' },
  { day: 'Sunday', open: 'Closed', close: 'Closed' },
]

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

async function main() {
  // Seed demo user
  const hash = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@beautybook.com' },
    update: {},
    create: {
      email: 'demo@beautybook.com',
      name: 'Arika Gibson',
      password: hash,
    },
  })

  // Seed professionals
  const pros = [
    {
      name: 'GlossLab Nails',
      bio: 'Award-winning nail studio specializing in gel, acrylic, and nail art. Walk-ins welcome!',
      email: 'glosslabnails@beautybook.tech',
      city: 'West Lafayette',
      state: 'IN',
      lat: 40.4259,
      lng: -86.9081,
      services: ['Nails', 'Gel', 'Acrylic', 'Nail Art'],
      priceMin: 45,
      priceMax: 85,
      phone: '(765) 555-0101',
      avgRating: 4.8,
      reviewCount: 34,
      gallery: [],
    },
    {
      name: 'Velvet Touch Studio',
      bio: 'Full-service beauty studio offering hair, lashes, and brow services.',
      email: 'velvettouch@beautybook.tech',
      city: 'Lafayette',
      state: 'IN',
      lat: 40.4167,
      lng: -86.8753,
      services: ['Hair', 'Lashes', 'Brows'],
      priceMin: 50,
      priceMax: 185,
      phone: '(765) 555-0202',
      avgRating: 4.5,
      reviewCount: 21,
      gallery: [],
    },
    {
      name: 'Blush Nail Bar',
      bio: 'Cozy nail bar with specialty nail art and luxury manicures.',
      email: 'blushnailbar@beautybook.tech',
      city: 'West Lafayette',
      state: 'IN',
      lat: 40.4312,
      lng: -86.9154,
      services: ['Nails', 'Manicure', 'Pedicure'],
      priceMin: 40,
      priceMax: 75,
      phone: '(765) 555-0303',
      avgRating: 4.6,
      reviewCount: 18,
      gallery: [],
    },
    {
      name: 'Psnailed It',
      bio: 'Trendy nail salon known for creative designs and fast service.',
      email: 'psnailedit@beautybook.tech',
      city: 'Lafayette',
      state: 'IN',
      lat: 40.4190,
      lng: -86.8820,
      services: ['Nails', 'Gel', 'Nail Art'],
      priceMin: 35,
      priceMax: 70,
      phone: '(765) 555-0404',
      avgRating: 4.3,
      reviewCount: 27,
      gallery: [],
    },
    {
      name: 'The Lash Lounge',
      bio: 'Certified lash artists offering classic, hybrid, and volume extensions.',
      email: 'lashlounge@beautybook.tech',
      city: 'West Lafayette',
      state: 'IN',
      lat: 40.4280,
      lng: -86.9100,
      services: ['Lashes'],
      priceMin: 80,
      priceMax: 200,
      phone: '(765) 555-0505',
      avgRating: 4.9,
      reviewCount: 42,
      gallery: [],
    },
  ]

  const cityPool = ['West Lafayette', 'Lafayette', 'Carmel', 'Fishers', 'Noblesville']
  const statePool = ['IN', 'IN', 'IN', 'IN', 'IN']

  const extrasByService = {
    Nails: ['Manicure', 'Pedicure', 'Gel'],
    Hair: ['Hair Color', 'Blowout', 'Styling'],
    Lashes: ['Classic Lashes', 'Hybrid Lashes', 'Volume Lashes'],
    Brows: ['Brow Shaping', 'Brow Tint', 'Brow Lamination'],
    Makeup: ['Bridal', 'Soft Glam', 'Event Makeup'],
    Tan: ['Spray Tan', 'Rapid Tan', 'Custom Tan'],
  }

  const baseCountByService = CORE_SERVICES.reduce((acc, service) => {
    acc[service] = pros.filter(p => p.services.includes(service)).length
    return acc
  }, {})

  CORE_SERVICES.forEach((service, index) => {
    const needed = Math.max(0, 10 - baseCountByService[service])

    for (let i = 1; i <= needed; i++) {
      const city = cityPool[(index + i) % cityPool.length]
      const state = statePool[(index + i) % statePool.length]
      const offset = (index + 1) * 0.01 + i * 0.002

      pros.push({
        name: `${service} Collective ${i}`,
        bio: `Specialized ${service.toLowerCase()} studio focused on clean technique, consistency, and client-first service.`,
        email: `${slugify(`${service} Collective ${i}`)}@beautybook.tech`,
        city,
        state,
        lat: 40.42 + offset,
        lng: -86.9 + offset,
        services: [service, ...extrasByService[service]],
        priceMin: 40 + index * 10,
        priceMax: 95 + index * 20,
        phone: `(765) 555-${String(6000 + index * 100 + i).padStart(4, '0')}`,
        avgRating: 4.2 + (i % 5) * 0.15,
        reviewCount: 12 + i * 3,
        gallery: [],
      })
    }
  })

  for (const pro of pros) {
    const id = slugify(pro.name)

    const created = await prisma.professional.upsert({
      where: { id },
      update: {
        ...pro,
      },
      create: {
        ...pro,
        id,
      },
    })

    await prisma.hours.deleteMany({
      where: { professionalId: created.id },
    })

    await prisma.hours.createMany({
      data: HOURS_TEMPLATE.map(h => ({ ...h, professionalId: created.id })),
      skipDuplicates: true,
    })
  }

  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
