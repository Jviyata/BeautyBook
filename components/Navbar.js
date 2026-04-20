'use client'
import Link from 'next/link'

const items = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'search', label: 'Search', href: '/search' },
  { id: 'saved', label: 'Saved', href: '/saved' },
  { id: 'profile', label: 'Profile', href: '/profile' },
]

export default function Navbar({ active }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#ececec] bg-white/95 backdrop-blur">
      <nav className="w-full px-3 sm:px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-[#1f1f1f] tracking-tight">
          Beauty Book
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {items.map(({ id, label, href }) => {
            const isActive = active === id
            return (
              <Link
                key={id}
                href={href}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors border-b-2 ${
                  isActive
                    ? 'text-[#e00707] border-[#e00707]'
                    : 'text-[#6f6f6f] border-transparent hover:text-[#1f1f1f]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
