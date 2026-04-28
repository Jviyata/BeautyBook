import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'beauty-book-dev-secret',
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        accountType: { label: 'Account Type', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const normalizedEmail = credentials.email.trim().toLowerCase()

        // Handle demo mode
        if (normalizedEmail === 'demo@beautybook.demo' && credentials.password === 'DemoPass123!') {
          let demoUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          })

          // Create demo user if it doesn't exist
          if (!demoUser) {
            demoUser = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name: 'Demo User',
                password: await bcrypt.hash('DemoPass123!', 10),
                role: credentials.accountType === 'tech' ? 'TECH' : 'USER',
                emailVerified: new Date(),
              },
            })
          }

          return { id: demoUser.id, email: demoUser.email, name: demoUser.name, image: demoUser.image, role: demoUser.role }
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        const requestedRole = credentials.accountType === 'tech' ? 'TECH' : 'USER'
        if (user.role !== requestedRole) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      if (user?.role) token.role = user.role
      return token
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id
      if (token && session.user) session.user.role = token.role
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
