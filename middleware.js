import { withAuth } from 'next-auth/middleware'

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || 'beauty-book-dev-secret',
  callbacks: {
    authorized: ({ req, token }) => {
      if (!token) return false

      if (req.nextUrl.pathname.startsWith('/tech')) {
        return token.role === 'TECH'
      }

      return true
    },
  },
})

export const config = {
  matcher: [
    '/',
    '/search/:path*',
    '/saved/:path*',
    '/profile/:path*',
    '/professionals/:path*',
    '/tech/:path*',
  ],
}
