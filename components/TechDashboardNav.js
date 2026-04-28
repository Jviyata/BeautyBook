'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/tech/messages', label: 'Messages' },
  { href: '/tech/hours', label: 'Hours' },
  { href: '/tech/profile', label: 'Profile' },
  { href: '/tech/calendar', label: 'Calendar' },
]

export default function TechDashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="rounded-2xl border border-[#e8e8e8] bg-white p-2">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/tech"
          className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            pathname === '/tech' ? 'bg-[#1f1f1f] text-white' : 'bg-[#fafafa] text-[#555]'
          }`}
        >
          Dashboard
        </Link>
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              pathname === tab.href ? 'bg-[#1f1f1f] text-white' : 'bg-[#fafafa] text-[#555]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
