'use client'
import Link from 'next/link'
import { Home, Search, Heart, User } from 'lucide-react'

const NAVBAR_ITEMS = [
  { id: 'home',    label: 'Home',    href: '/',        Icon: Home },
  { id: 'search',  label: 'Explore', href: '/search',  Icon: Search },
  { id: 'saved',   label: 'Saved',   href: '/saved',   Icon: Heart },
  { id: 'profile', label: 'Profile', href: '/profile', Icon: User },
]

function NavLink({ item, isActive }) {
  const { id, label, href, Icon } = item
  
  return (
    <Link
      key={id}
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'text-[#7f294d] bg-[#fff1f7]'
          : 'text-[#7c6d74] hover:text-[#7f294d] hover:bg-[#fff7fa]'
      }`}
    >
      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
      {label}
    </Link>
  )
}

function MobileNavLink({ item, isActive }) {
  const { id, label, href, Icon } = item
  
  return (
    <Link
      key={id}
      href={href}
      className="flex flex-col items-center gap-0.5 flex-1 py-2 transition-all"
    >
      <Icon
        size={22}
        strokeWidth={isActive ? 2.4 : 1.7}
        className={isActive ? 'fill-[#f7c9dc] text-[#c53f76]' : 'text-[#8a8a8a]'}
      />
      <span className={`text-[10px] font-medium ${isActive ? 'text-[#c53f76]' : 'text-[#8a8a8a]'}`}>
        {label}
      </span>
    </Link>
  )
}

export default function Navbar({ active }) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#e8e8e8] bg-white/95 backdrop-blur-md">
        <nav className="w-full px-4 h-[60px] flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-tight text-[#7f294d]">
            Beauty Book
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAVBAR_ITEMS.map((item) => (
              <NavLink key={item.id} item={item} isActive={active === item.id} />
            ))}
          </div>
        </nav>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e8e8e8] flex items-center justify-around h-[60px]">
        {NAVBAR_ITEMS.map((item) => (
          <MobileNavLink key={item.id} item={item} isActive={active === item.id} />
        ))}
      </nav>
    </>
  )
}
