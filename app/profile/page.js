'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Star, LogOut, Heart, User } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/favorites')
        .then(r => r.json())
        .then(data => {
          setSaved(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
      return
    }

    if (status === 'unauthenticated') {
      const raw = localStorage.getItem('guestFavorites')
      const ids = raw ? JSON.parse(raw) : []

      if (!Array.isArray(ids) || ids.length === 0) {
        setSaved([])
        setLoading(false)
        return
      }

      Promise.all(
        ids.map((id) =>
          fetch(`/api/professionals/${id}`)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      ).then((pros) => {
        setSaved(pros.filter(Boolean))
        setLoading(false)
      })
    }
  }, [status])

  async function removeFavorite(professionalId) {
    if (status === 'unauthenticated') {
      const raw = localStorage.getItem('guestFavorites')
      const ids = raw ? JSON.parse(raw) : []
      const next = Array.isArray(ids) ? ids.filter(id => id !== professionalId) : []
      localStorage.setItem('guestFavorites', JSON.stringify(next))
      setSaved(prev => prev.filter(p => p.id !== professionalId))
      return
    }

    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId }),
    })
    setSaved(prev => prev.filter(p => p.id !== professionalId))
  }

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-[#1f1f1f]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="profile" />
      {/* Header */}
      <div className="bg-white border-b border-[#ececec] px-5 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#f1f1f1] flex items-center justify-center text-xl font-display text-[#1f1f1f] font-semibold">
              {session?.user?.name?.charAt(0) || <User size={20} />}
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-[#2C1A23]">
                {session?.user?.name || 'Guest User'}
              </h1>
              <p className="text-xs text-[#7a5a67]">{session?.user?.email || 'No account connected'}</p>
            </div>
          </div>
          {status === 'authenticated' ? (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1.5 text-xs text-[#666] border border-[#ececec] px-3 py-2 rounded-xl hover:border-[#1f1f1f] transition-colors"
            >
              <LogOut size={13} />
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs text-[#666] border border-[#ececec] px-3 py-2 rounded-xl hover:border-[#1f1f1f] transition-colors"
            >
              <User size={13} />
              Sign in
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-5">
          <div className="flex-1 bg-[#f7f7f7] rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-semibold text-[#1f1f1f]">{saved.length}</div>
            <div className="text-xs text-[#7a5a67] mt-0.5">Saved</div>
          </div>
          <div className="flex-1 bg-[#f7f7f7] rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-semibold text-[#1f1f1f]">0</div>
            <div className="text-xs text-[#7a5a67] mt-0.5">Reviews</div>
          </div>
          <div className="flex-1 bg-[#f7f7f7] rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-semibold text-[#1f1f1f]">0</div>
            <div className="text-xs text-[#7a5a67] mt-0.5">Bookings</div>
          </div>
        </div>
      </div>

      {/* Saved / Pinned Techs */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={16} className="text-[#1f1f1f]" />
          <h2 className="font-display text-base font-semibold text-[#2C1A23]">Pinned Techs</h2>
        </div>

        {saved.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#ececec]">
            <p className="font-medium text-[#2C1A23] text-sm">No saved professionals yet</p>
            <p className="text-xs text-[#7a5a67] mt-1 mb-4">Tap the heart on any profile to save them here</p>
            <Link
              href="/search"
              className="inline-block bg-[#1f1f1f] text-white px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              Discover Professionals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {saved.map(pro => (
              <div key={pro.id} className="bg-white rounded-2xl border border-[#ececec] overflow-hidden relative">
                <button
                  onClick={() => removeFavorite(pro.id)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center"
                >
                  <Heart size={13} className="fill-[#1f1f1f] text-[#1f1f1f]" />
                </button>
                <Link href={`/professionals/${pro.id}`}>
                  <div className="h-24 bg-gradient-to-br from-[#f0f0f0] to-[#e7e7e7] flex items-center justify-center text-2xl">
                    {pro.name?.charAt(0)}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-[#2C1A23] truncate">{pro.name}</div>
                    <div className="text-xs text-[#7a5a67] truncate mt-0.5">{pro.city}</div>
                    {pro.avgRating && (
                      <div className="flex items-center gap-0.5 mt-1">
                        <Star size={10} className="fill-[#1f1f1f] text-[#1f1f1f]" />
                        <span className="text-xs text-[#2C1A23]">{pro.avgRating}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
