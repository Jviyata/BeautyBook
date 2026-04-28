'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()
  const [accountType, setAccountType] = useState('user')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [callbackUrl, setCallbackUrl] = useState('/')
  const [postLoginRedirect, setPostLoginRedirect] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const fromQuery = new URLSearchParams(window.location.search).get('callbackUrl')
    if (fromQuery) setCallbackUrl(fromQuery)
  }, [])

  useEffect(() => {
    const target = postLoginRedirect || callbackUrl
    if (status === 'authenticated') {
      router.replace(target)
    }
  }, [status, router, callbackUrl, postLoginRedirect])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    const destination = accountType === 'tech' ? '/tech' : callbackUrl
    setPostLoginRedirect(destination)

    const result = await signIn('credentials', {
      redirect: false,
      email: email.trim().toLowerCase(),
      password,
      callbackUrl: destination,
    })

    if (result?.ok) {
      router.push(destination)
      return
    }

    setError('Invalid email or password.')
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#fdf6f9] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-[#FBEAF0] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M18 4C12 4 7 8.5 7 14c0 3 1.5 5.5 4 7.5V28l7-3 7 3v-6.5c2.5-2 4-4.5 4-7.5C29 8.5 24 4 18 4z" fill="#D4537E" opacity="0.2"/>
            <path d="M18 6C12.5 6 9 10 9 14c0 2.5 1.2 5 3.5 6.8V27l5.5-2.5L23.5 27v-6.2C25.8 19 27 16.5 27 14c0-4-3.5-8-9-8z" stroke="#D4537E" strokeWidth="1.5" fill="none"/>
            <circle cx="15" cy="13" r="2" fill="#D4537E"/>
            <circle cx="21" cy="13" r="2" fill="#D4537E"/>
            <path d="M14 18c1 1.5 7 1.5 8 0" stroke="#D4537E" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#2C1A23]">Beauty Book</h1>
        <p className="text-[#7a5a67] text-sm mt-1">Sign in to continue</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#F4C0D1] p-6">
        <div className="mb-4 rounded-xl border border-[#F4C0D1] bg-[#fdf6f9] p-1 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setAccountType('user')}
            className={`rounded-lg py-2 text-xs font-medium transition-colors ${
              accountType === 'user' ? 'bg-white text-[#2C1A23] border border-[#F4C0D1]' : 'text-[#7a5a67]'
            }`}
          >
            Everyday User
          </button>
          <button
            type="button"
            onClick={() => setAccountType('tech')}
            className={`rounded-lg py-2 text-xs font-medium transition-colors ${
              accountType === 'tech' ? 'bg-white text-[#2C1A23] border border-[#F4C0D1]' : 'text-[#7a5a67]'
            }`}
          >
            Tech
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-1.5 px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm outline-none focus:border-[#D4537E] transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm outline-none focus:border-[#D4537E] transition-colors pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bba0ab]"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className={`text-xs px-3 py-2 rounded-lg border ${error ? 'text-[#b42318] bg-[#fff1f3] border-[#f3b7c3]' : 'text-[#7a5a67] bg-[#fdf6f9] border-[#F4C0D1]'}`}>
            {error || (accountType === 'tech' ? 'Sign in as a tech to access the tech dashboard.' : 'Sign in as an everyday user to browse professionals.')}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#D4537E] text-white py-3.5 rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[#7a5a67]">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#D4537E] font-medium hover:underline">
            Register
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-[#F4C0D1]">
          <p className="text-xs text-center text-[#bba0ab]">Use your registered account to sign in.</p>
        </div>
      </div>
    </div>
  )
}
