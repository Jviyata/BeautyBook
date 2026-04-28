import { withAuth } from 'next-auth/middleware'

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || 'beauty-book-dev-secret',
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
