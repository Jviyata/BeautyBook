const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

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

  for (const pro of pros) {
    const created = await prisma.professional.upsert({
      where: { id: pro.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        ...pro,
        id: pro.name.toLowerCase().replace(/\s+/g, '-'),
      },
    })

    await prisma.hours.createMany({
      data: [
        { professionalId: created.id, day: 'Monday', open: '9:00 AM', close: '6:00 PM' },
        { professionalId: created.id, day: 'Tuesday', open: '9:00 AM', close: '6:00 PM' },
        { professionalId: created.id, day: 'Wednesday', open: '9:00 AM', close: '7:00 PM' },
        { professionalId: created.id, day: 'Thursday', open: '9:00 AM', close: '7:00 PM' },
        { professionalId: created.id, day: 'Friday', open: '9:00 AM', close: '8:00 PM' },
        { professionalId: created.id, day: 'Saturday', open: '10:00 AM', close: '5:00 PM' },
        { professionalId: created.id, day: 'Sunday', open: 'Closed', close: 'Closed' },
      ],
      skipDuplicates: true,
    })
  }

  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
