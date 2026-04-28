'use client'
import Link from 'next/link'
import { Home, Search, Bookmark, User } from 'lucide-react'

const items = [
  { id: 'home',    label: 'Home',    href: '/',        Icon: Home },
  { id: 'search',  label: 'Explore', href: '/search',  Icon: Search },
  { id: 'saved',   label: 'Saved',   href: '/saved',   Icon: Bookmark },
  { id: 'profile', label: 'Profile', href: '/profile', Icon: User },
]

export default function Navbar({ active }) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#e8e8e8] bg-white/95 backdrop-blur-md">
        <nav className="w-full px-4 h-[60px] flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-tight text-[#1f1f1f]">
            Beauty Book
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {items.map(({ id, label, href, Icon }) => {
              const isActive = active === id
              return (
                <Link
                  key={id}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-[#111827] bg-[#f5f5f4]'
                      : 'text-[#6f6f6f] hover:text-[#1f1f1f] hover:bg-[#fafaf9]'
                  }`}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e8e8e8] flex items-center justify-around h-[60px]">
        {items.map(({ id, label, href, Icon }) => {
          const isActive = active === id
          return (
            <Link
              key={id}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2 transition-all"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.4 : 1.7}
                className={isActive ? 'text-[#111827]' : 'text-[#8a8a8a]'}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#111827]' : 'text-[#8a8a8a]'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
