'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
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
        <p className="text-[#7a5a67] text-sm mt-1">Sign in is temporarily disabled</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#F4C0D1] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Email</label>
            <input
              type="email"
              disabled
              value=""
              onChange={() => {}}
              placeholder="you@example.com"
              className="w-full mt-1.5 px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm outline-none focus:border-[#D4537E] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                disabled
                value=""
                onChange={() => {}}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm outline-none focus:border-[#D4537E] transition-colors pr-10"
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

          <div className="text-xs text-[#7a5a67] bg-[#fdf6f9] px-3 py-2 rounded-lg border border-[#F4C0D1]">
            Auth is temporarily disabled. Continue as guest to explore features.
          </div>

          <button
            type="submit"
            disabled
            className="w-full bg-[#D4537E] text-white py-3.5 rounded-xl font-medium opacity-60 cursor-not-allowed"
          >
            Sign In (Disabled)
          </button>
        </form>

        <button
          onClick={() => router.push('/')}
          className="w-full mt-3 bg-white text-[#D4537E] py-3 rounded-xl font-medium border border-[#D4537E]"
        >
          Continue as Guest
        </button>

        <div className="mt-5 text-center text-sm text-[#7a5a67]">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#D4537E] font-medium hover:underline">
            Register
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-[#F4C0D1]">
          <p className="text-xs text-center text-[#bba0ab]">Demo: demo@beautybook.com / password123</p>
        </div>
      </div>
    </div>
  )
}
