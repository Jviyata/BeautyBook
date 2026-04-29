/*
'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Star, LogOut, Heart, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState('saved')
  const [saved, setSaved] = useState([])
  const [reviews, setReviews] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [calMonth, setCalMonth] = useState(new Date())

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/favorites').then(r => r.json()).catch(() => []),
        fetch('/api/reviews?mine=1').then(r => r.json()).catch(() => []),
        fetch('/api/bookings').then(r => r.json()).catch(() => []),
      ]).then(([favs, revs, bkgs]) => {
        setSaved(Array.isArray(favs) ? favs : [])
        setReviews(Array.isArray(revs) ? revs : [])
        setBookings(Array.isArray(bkgs) ? bkgs : [])
        setLoading(false)
      })
    } else if (status === 'unauthenticated') {
      const raw = localStorage.getItem('guestFavorites')
      const ids = raw ? JSON.parse(raw) : []
      if (!Array.isArray(ids) || ids.length === 0) { setLoading(false); return }
      Promise.all(ids.map(id =>
        fetch(`/api/professionals/${id}`).then(r => r.ok ? r.json() : null).catch(() => null)
      )).then(pros => { setSaved(pros.filter(Boolean)); setLoading(false) })
    }
  }, [status])

  async function togglePin(professionalId) {
    await fetch('/api/favorites', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId }),
    })
    setSaved(prev => prev.map(p => p.id === professionalId ? { ...p, pinned: !p.pinned } : p))
  }
*/

'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Heart, Star, Calendar, LogOut, User, MessageCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState('saved')
  const [saved, setSaved] = useState([])
  const [reviews, setReviews] = useState([])
  const [bookings, setBookings] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [messageSending, setMessageSending] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [bookingToCancel, setBookingToCancel] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/favorites').then(r => r.json()).catch(() => []),
        fetch('/api/reviews?mine=1').then(r => r.json()).catch(() => []),
        fetch('/api/bookings').then(r => r.json()).catch(() => []),
        fetch('/api/messages').then(r => r.json()).catch(() => ({ conversations: [] })),
      ]).then(([f, r, b, m]) => {
        setSaved(Array.isArray(f) ? f : [])
        setReviews(Array.isArray(r) ? r : [])
        setBookings(Array.isArray(b) ? b : [])
        const nextConversations = Array.isArray(m?.conversations) ? m.conversations : []
        setConversations(nextConversations)
        setSelectedConversationId((current) => current || nextConversations[0]?.id || '')
        setLoading(false)
      })
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
      Promise.all(ids.map(id => fetch(`/api/professionals/${id}`).then(r => (r.ok ? r.json() : null)).catch(() => null)))
        .then(pros => {
          setSaved(pros.filter(Boolean))
          setLoading(false)
        })
    }
  }, [status])

  const sortedSaved = useMemo(() => [...saved].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)), [saved])
  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || conversations[0] || null,
    [conversations, selectedConversationId],
  )

  async function togglePin(professionalId) {
    await fetch('/api/favorites', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId }),
    })
    setSaved(prev => prev.map(p => (p.id === professionalId ? { ...p, pinned: !p.pinned } : p)))
  }

  async function sendMessage() {
    if (!selectedConversation || !messageDraft.trim()) return

    setMessageError('')
    setMessageSending(true)

    try {
      const res = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: messageDraft.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessageError(data?.error || 'Could not send message.')
        setMessageSending(false)
        return
      }

      const updatedConversation = data.conversation
      setConversations((current) => [
        updatedConversation,
        ...current.filter((conversation) => conversation.id !== updatedConversation.id),
      ])
      setSelectedConversationId(updatedConversation.id)
      setMessageDraft('')
    } catch {
      setMessageError('Could not send message.')
    } finally {
      setMessageSending(false)
    }
  }

  async function confirmCancelBooking() {
    if (!bookingToCancel) return

    setCancelError('')
    setCancelLoading(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bookingToCancel.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCancelError(data?.error || 'Could not cancel booking.')
        setCancelLoading(false)
        return
      }

      setBookings((current) => current.filter((booking) => booking.id !== bookingToCancel.id))
      setBookingToCancel(null)
    } catch {
      setCancelError('Could not cancel booking.')
    } finally {
      setCancelLoading(false)
    }
  }

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="profile" />

      <div className="bg-white border-b border-[#ececec] px-5 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#f1f1f1] flex items-center justify-center">
              {session?.user?.name?.charAt(0) || <User size={20} />}
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-[#2C1A23]">{session?.user?.name || 'Guest User'}</h1>
              <p className="text-xs text-[#7a5a67]">{session?.user?.email || 'No account connected'}</p>
            </div>
          </div>
          {status === 'authenticated' && (
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-xs border border-[#ececec] px-3 py-2 rounded-xl flex items-center gap-1.5">
              <LogOut size={13} /> Sign out
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border-b border-[#ececec] flex">
        <button onClick={() => setTab('saved')} className={`flex-1 py-3 text-xs border-b-2 ${tab === 'saved' ? 'accent-tab' : 'border-transparent text-[#7a5a67]'}`}>Saved</button>
        <button onClick={() => setTab('reviews')} className={`flex-1 py-3 text-xs border-b-2 ${tab === 'reviews' ? 'accent-tab' : 'border-transparent text-[#7a5a67]'}`}>Reviews</button>
        <button onClick={() => setTab('calendar')} className={`flex-1 py-3 text-xs border-b-2 ${tab === 'calendar' ? 'accent-tab' : 'border-transparent text-[#7a5a67]'}`}>Calendar</button>
        <button onClick={() => setTab('messages')} className={`flex-1 py-3 text-xs border-b-2 ${tab === 'messages' ? 'accent-tab' : 'border-transparent text-[#7a5a67]'}`}>Messages</button>
      </div>

      <div className="px-4 py-5">
        {tab === 'saved' && (
          <div className="grid grid-cols-2 gap-3">
            {sortedSaved.map(pro => (
              <div key={pro.id} className="bg-white rounded-2xl border border-[#f0d9e3] p-3">
                <div className="flex items-center justify-between">
                  <Link href={`/professionals/${pro.id}`} className="text-sm font-medium truncate">{pro.name}</Link>
                  {status === 'authenticated' && (
                    <button onClick={() => togglePin(pro.id)} aria-label="Favorite tech" className={`heart-toggle rounded-full p-1.5 transition-all ${pro.pinned ? 'active' : ''}`}>
                      <Heart size={14} className={pro.pinned ? 'fill-[var(--pink)] text-[var(--pink)]' : 'text-[#b76b89]'} />
                    </button>
                  )}
                </div>
                <div className="text-xs text-[#7a5a67] mt-1">{pro.city}</div>
              </div>
            ))}
            {sortedSaved.length === 0 && <div className="col-span-2 text-sm text-[#7a5a67]">No saved professionals yet.</div>}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-[#ececec] p-3">
                <Link href={`/professionals/${r.professionalId}`} className="text-sm font-medium">{r.professional?.name}</Link>
                <div className="text-xs text-[#7a5a67] mt-1">{r.comment || 'No comment'}</div>
              </div>
            ))}
            {reviews.length === 0 && <div className="text-sm text-[#7a5a67]">No reviews yet.</div>}
          </div>
        )}

        {tab === 'calendar' && (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-[#ececec] p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar size={14} />
                  <Link href={`/professionals/${b.professionalId}`} className="text-sm font-medium truncate">{b.professional?.name}</Link>
                  <span className="text-xs text-[#7a5a67] shrink-0">{new Date(b.date).toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingToCancel(b)}
                  className="shrink-0 rounded-xl border border-[#f1c7d6] px-3 py-1.5 text-xs font-semibold text-[#b42318] hover:bg-[#fff4f6]"
                >
                  Cancel
                </button>
              </div>
            ))}
            {bookings.length === 0 && <div className="text-sm text-[#7a5a67]">No bookings yet.</div>}
          </div>
        )}

        {tab === 'messages' && (
          status === 'unauthenticated' ? (
            <div className="rounded-2xl border border-[#ececec] bg-white p-5 text-center">
              <p className="text-sm text-[#7a5a67]">Sign in to view your Beauty Book conversations.</p>
              <Link href="/login" className="mt-3 inline-flex rounded-xl bg-[var(--pink)] px-4 py-2 text-sm font-semibold text-white">
                Sign in
              </Link>
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-2xl border border-[#ececec] bg-white p-5 text-center">
              <p className="text-sm font-medium text-[#2C1A23]">No conversations yet</p>
              <p className="mt-1 text-xs text-[#7a5a67]">Message a technician from their profile to keep the conversation inside the app.</p>
              <Link href="/search" className="mt-3 inline-flex rounded-xl bg-[var(--pink)] px-4 py-2 text-sm font-semibold text-white">
                Find a technician
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-[260px_1fr]">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'border-[#f3d7e3] bg-[#fff8fb]'
                        : 'border-[#ececec] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1f1f1f] truncate">{conversation.professional?.name}</p>
                      <MessageCircle size={14} className="shrink-0 text-[var(--pink)]" />
                    </div>
                    <p className="mt-1 text-xs text-[#7a5a67] truncate">{conversation.lastMessage?.body || 'No messages yet'}</p>
                    <p className="mt-1 text-[10px] text-[#bba0ab]">{new Date(conversation.lastMessageAt).toLocaleString()}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-[#ececec] bg-white p-4">
                <div className="border-b border-[#f0f0f0] pb-3">
                  <Link href={`/professionals/${selectedConversation.professional?.id}`} className="text-sm font-semibold text-[#1f1f1f] hover:text-[var(--pink)]">
                    {selectedConversation.professional?.name}
                  </Link>
                  <p className="text-xs text-[#7a5a67]">{selectedConversation.professional?.city}, {selectedConversation.professional?.state}</p>
                </div>

                <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        message.mine
                          ? 'ml-auto bg-[var(--pink)] text-white'
                          : 'bg-[#fafafa] border border-[#ececec] text-[#444]'
                      }`}
                    >
                      <p>{message.body}</p>
                      <p className={`mt-1 text-[10px] ${message.mine ? 'text-white/80' : 'text-[#999]'}`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-2">
                  <textarea
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    placeholder={`Reply to ${selectedConversation.professional?.name}...`}
                    className="min-h-[96px] w-full rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={messageSending}
                    className="rounded-xl bg-[var(--pink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {messageSending ? 'Sending...' : 'Send reply'}
                  </button>
                  {messageError ? <p className="text-xs text-[#b42318]">{messageError}</p> : null}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1a23]/40 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#f0d9e3] bg-white p-5 shadow-[0_24px_60px_rgba(44,26,35,0.18)]">
            <h2 className="text-lg font-semibold text-[#1f1f1f]">Cancel Appointment?</h2>
            <p className="mt-2 text-sm text-[#666]">
              Are you sure you want to cancel your appointment request with {bookingToCancel.professional?.name} scheduled for {new Date(bookingToCancel.date).toLocaleString()}?
            </p>
            {cancelError ? <p className="mt-3 text-xs text-[#b42318]">{cancelError}</p> : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (cancelLoading) return
                  setBookingToCancel(null)
                  setCancelError('')
                }}
                className="flex-1 rounded-xl border border-[#f0d9e3] px-4 py-2 text-sm font-semibold text-[var(--pink-ink)]"
              >
                Keep appointment
              </button>
              <button
                type="button"
                onClick={confirmCancelBooking}
                disabled={cancelLoading}
                className="flex-1 rounded-xl bg-[#b42318] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {cancelLoading ? 'Canceling...' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
/*
  return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar active="profile" />

        <div className="bg-white border-b border-[#ececec] px-5 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#f1f1f1] flex items-center justify-center text-xl font-display text-[#1f1f1f] font-semibold">
                {session?.user?.name?.charAt(0) || <User size={20} />}
              </div>
              <div>
                <h1 className="font-display text-lg font-semibold text-[#2C1A23]">{session?.user?.name || 'Guest User'}</h1>
                <p className="text-xs text-[#7a5a67]">{session?.user?.email || 'No account connected'}</p>
              </div>
            </div>
            {status === 'authenticated' ? (
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-1.5 text-xs text-[#666] border border-[#ececec] px-3 py-2 rounded-xl hover:border-[#1f1f1f] transition-colors">
                <LogOut size={13} /> Sign out
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 text-xs text-[#666] border border-[#ececec] px-3 py-2 rounded-xl hover:border-[#1f1f1f] transition-colors">
                <User size={13} /> Sign in
              </Link>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-5">
            {[
              { label: 'Saved', value: saved.length, color: 'text-[#1f1f1f]' },
              { label: 'Pinned', value: pinnedCount, color: 'text-[#e75480]' },
              { label: 'Reviews', value: reviews.length, color: 'text-[#1f1f1f]' },
              { label: 'Bookings', value: bookings.length, color: 'text-[#1f1f1f]' },
            ].map(s => (
              <div key={s.label} className="bg-[#f7f7f7] rounded-xl px-2 py-3 text-center">
                <div className={`text-xl font-semibold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[#7a5a67] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-b border-[#ececec] flex">
          {[
            { id: 'saved', label: 'Saved', icon: <Heart size={13} /> },
            { id: 'reviews', label: 'Reviews', icon: <Star size={13} /> },
            { id: 'calendar', label: 'Calendar', icon: <Calendar size={13} /> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? 'border-[#1f1f1f] text-[#1f1f1f]' : 'border-transparent text-[#aaa]'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="px-4 py-5">
          {tab === 'saved' && (sortedSaved.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#ececec]">
              <p className="font-medium text-[#2C1A23] text-sm">No saved professionals yet</p>
              <p className="text-xs text-[#7a5a67] mt-1 mb-4">Tap the heart on any profile to save them here</p>
              <Link href="/search" className="inline-block bg-[#1f1f1f] text-white px-5 py-2.5 rounded-xl text-sm font-medium">Discover Professionals</Link>
            </div>
          ) : (
            <>
              {pinnedCount > 0 && (
                <p className="text-xs text-[#7a5a67] mb-3 flex items-center gap-1">
                  <Heart size={11} className="fill-[#e75480] text-[#e75480]" />
                  {pinnedCount} pinned tech{pinnedCount > 1 ? 's' : ''} shown first
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {sortedSaved.map(pro => (
                  <div key={pro.id} className={`bg-white rounded-2xl border overflow-hidden relative ${pro.pinned ? 'border-[#e75480]/40 ring-1 ring-[#e75480]/20' : 'border-[#ececec]'}`}>
                    {status === 'authenticated' && (
                      <button onClick={() => togglePin(pro.id)} title={pro.pinned ? 'Unpin' : 'Pin this tech'}
                        className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                        <Heart size={13} className={pro.pinned ? 'fill-[#e75480] text-[#e75480]' : 'text-[#ccc]'} />
                      </button>
                    )}
                    <Link href={`/professionals/${pro.id}`}>
                      <div className="h-24 bg-gradient-to-br from-[#f0f0f0] to-[#e7e7e7] flex items-center justify-center text-2xl font-semibold text-[#aaa]">
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
                    <button onClick={() => removeFavorite(pro.id)} className="w-full text-[10px] text-[#bbb] hover:text-red-400 border-t border-[#f5f5f5] py-1.5 transition-colors">Remove</button>
                  </div>
                ))}
              </div>
            </>
          ))}

          {tab === 'reviews' && (status === 'unauthenticated' ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#ececec]">
              <p className="text-sm font-medium text-[#2C1A23]">Sign in to see your reviews</p>
              <Link href="/login" className="inline-block mt-4 bg-[#1f1f1f] text-white px-5 py-2.5 rounded-xl text-sm font-medium">Sign in</Link>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#ececec]">
              <p className="font-medium text-[#2C1A23] text-sm">No reviews yet</p>
              <p className="text-xs text-[#7a5a67] mt-1 mb-4">Visit a professional&apos;s page to leave a review</p>
              <Link href="/search" className="inline-block bg-[#1f1f1f] text-white px-5 py-2.5 rounded-xl text-sm font-medium">Find Professionals</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-[#ececec] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/professionals/${r.professionalId}`} className="text-sm font-medium text-[#2C1A23] hover:underline">{r.professional?.name}</Link>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= r.rating ? 'fill-[#1f1f1f] text-[#1f1f1f]' : 'text-[#ddd]'} />)}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-[#555] mt-2 leading-relaxed">{r.comment}</p>}
                  <p className="text-[10px] text-[#bbb] mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ))}

          {tab === 'calendar' && (status === 'unauthenticated' ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#ececec]">
              <p className="text-sm font-medium text-[#2C1A23]">Sign in to manage bookings</p>
              <Link href="/login" className="inline-block mt-4 bg-[#1f1f1f] text-white px-5 py-2.5 rounded-xl text-sm font-medium">Sign in</Link>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-[#ececec] p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setCalMonth(new Date(year, month - 1))} className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center"><ChevronLeft size={14} /></button>
                  <span className="text-sm font-semibold text-[#2C1A23]">{monthName}</span>
                  <button onClick={() => setCalMonth(new Date(year, month + 1))} className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center"><ChevronRight size={14} /></button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-center">
                  {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-[10px] text-[#bbb] py-1">{d}</div>)}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = new Date(year, month, i + 1)
                    const isBooked = bookedDates.has(d.toDateString())
                    const isToday = d.toDateString() === new Date().toDateString()
                    return (
                      <div key={i} className={['text-xs py-1.5 rounded-lg font-medium', isToday ? 'bg-[#1f1f1f] text-white' : '', isBooked && !isToday ? 'bg-[#e75480]/15 text-[#e75480] font-semibold' : '', !isBooked && !isToday ? 'text-[#555]' : ''].join(' ')}>
                        {i + 1}
                      </div>
                    )
                  })}
                </div>
                {bookedDates.size > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-[#7a5a67]">
                    <span className="w-3 h-3 rounded-sm bg-[#e75480]/15 inline-block" /> Booked appointment
                  </div>
                )}
              </div>
              <h3 className="text-xs font-semibold text-[#7a5a67] uppercase tracking-wide mb-3">Upcoming Bookings</h3>
              {bookings.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-2xl border border-[#ececec]">
                  <p className="text-sm font-medium text-[#2C1A23]">No bookings yet</p>
                  <p className="text-xs text-[#7a5a67] mt-1 mb-4">Book an appointment from a professional&apos;s profile</p>
                  <Link href="/search" className="inline-block bg-[#1f1f1f] text-white px-5 py-2.5 rounded-xl text-sm font-medium">Find a Tech</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {[...bookings].sort((a, b) => new Date(a.date) - new Date(b.date)).map(b => (
                    <div key={b.id} className="bg-white rounded-2xl border border-[#ececec] p-4 flex items-center gap-4">
                      <div className="bg-[#f7f7f7] rounded-xl w-12 h-12 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-[#7a5a67]">{new Date(b.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-semibold text-[#2C1A23] leading-none">{new Date(b.date).getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/professionals/${b.professionalId}`} className="text-sm font-medium text-[#2C1A23] hover:underline truncate block">{b.professional?.name}</Link>
                        <div className="text-xs text-[#7a5a67] mt-0.5">{new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        {b.notes && <div className="text-xs text-[#aaa] mt-0.5 truncate">{b.notes}</div>}
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-medium shrink-0 ${b.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-[#f7f7f7] text-[#999]'}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ))}
        </div>
      </div>
    )
  }
*/
