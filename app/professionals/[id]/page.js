'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Star, MapPin, Phone, Instagram, Globe, Heart, ArrowLeft, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ReviewForm from '@/components/ReviewForm'

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function ProfessionalPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [messageBoard, setMessageBoard] = useState([])
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageError, setMessageError] = useState('')

  useEffect(() => {
    fetch(`/api/professionals/${id}`)
      .then(r => r.json())
      .then(data => {
        setPro(data)
        if (session?.user) {
          setFavorited(data.isFavorited)
        } else {
          const raw = localStorage.getItem('guestFavorites')
          const ids = raw ? JSON.parse(raw) : []
          setFavorited(Array.isArray(ids) && ids.includes(id))
        }
        setLoading(false)
      })
  }, [id, session?.user])

  useEffect(() => {
    if (!session?.user) return
    setSenderName((prev) => prev || session.user.name || '')
    setSenderEmail((prev) => prev || session.user.email || '')
  }, [session])

  async function toggleFavorite() {
    if (!session) {
      const raw = localStorage.getItem('guestFavorites')
      const ids = raw ? JSON.parse(raw) : []
      const safeIds = Array.isArray(ids) ? ids : []
      const next = safeIds.includes(id)
        ? safeIds.filter(x => x !== id)
        : [...safeIds, id]
      localStorage.setItem('guestFavorites', JSON.stringify(next))
      setFavorited(next.includes(id))
      return
    }
    setFavLoading(true)
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId: id }),
    })
    const data = await res.json()
    setFavorited(data.favorited)
    setFavLoading(false)
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    setMessageError('')

    if (!senderName.trim() || !senderEmail.trim() || !draftMessage.trim()) {
      setMessageError('Please complete your name, email, and message.')
      return
    }

    setSendingMessage(true)

    try {
      const res = await fetch(`/api/professionals/${id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: senderName.trim(),
          email: senderEmail.trim(),
          message: draftMessage.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessageError(data?.error || 'Could not send message.')
        setSendingMessage(false)
        return
      }

      setMessageBoard((current) => [
        ...current,
        {
          id: Date.now(),
          author: senderName.trim(),
          email: senderEmail.trim(),
          text: draftMessage.trim(),
          createdAt: new Date().toISOString(),
        },
      ])
      setDraftMessage('')
    } catch {
      setMessageError('Could not send message.')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
      <div className="text-[#1f1f1f]">Loading...</div>
    </div>
  )

  if (!pro || pro.error) return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center gap-4">
      <p className="text-[#555]">Professional not found</p>
      <button onClick={() => router.back()} className="text-[#1f1f1f] text-sm">← Go back</button>
    </div>
  )

  const sortedHours = (pro.hours || []).sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  )

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="search" />

      <main className="page-shell space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-[#555] hover:text-[#1f1f1f]"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <section className="soft-panel rounded-3xl overflow-hidden">
          <div className="h-44 bg-gradient-to-br from-stone-100 via-neutral-50 to-stone-200 relative">
            {pro.image && (
              <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              <div className="story-ring">
                <div className="w-20 h-20 rounded-full bg-[#1f1f1f] text-white flex items-center justify-center text-3xl font-display border border-white shadow-md">
                  {pro.name.charAt(0)}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    favorited
                      ? 'bg-[#1f1f1f] text-white border-[#1f1f1f]'
                      : 'bg-white text-[#1f1f1f] border-[#e7e5e4] hover:border-[#d6d3d1]'
                  }`}
                >
                  <Heart size={14} className={favorited ? 'fill-white text-white' : 'text-[#666]'} />
                  {favorited ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <h1 className="font-display text-2xl leading-tight">{pro.name}</h1>
            <p className="mt-0.5 text-sm text-[#666] inline-flex items-center gap-1">
              <MapPin size={12} /> {pro.city}, {pro.state}
            </p>

            <div className="flex gap-5 mt-4 pt-4 border-t border-[#f0f0f0]">
              {pro.avgRating && (
                <div className="text-center">
                  <p className="font-bold text-base">{pro.avgRating}</p>
                  <p className="text-[11px] text-[#888]">Rating</p>
                </div>
              )}
              <div className="text-center">
                <p className="font-bold text-base">{pro.reviewCount || 0}</p>
                <p className="text-[11px] text-[#888]">Reviews</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-base">${pro.priceMin}–{pro.priceMax}</p>
                <p className="text-[11px] text-[#888]">Price</p>
              </div>
              {pro.gallery?.length > 0 && (
                <div className="text-center">
                  <p className="font-bold text-base">{pro.gallery.length}</p>
                  <p className="text-[11px] text-[#888]">Posts</p>
                </div>
              )}
            </div>

            {pro.bio && <p className="text-sm text-[#666] mt-3 leading-relaxed">{pro.bio}</p>}

            <div className="flex flex-wrap gap-1.5 mt-3">
              {pro.services?.map(s => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-[#fafaf9] border border-[#e7e5e4] text-[#555]">{s}</span>
              ))}
            </div>

            <button className="w-full mt-4 bg-[#1f1f1f] text-white rounded-xl py-3 text-sm font-semibold shadow hover:bg-[#111827] transition-colors">
              Request Booking
            </button>
          </div>
        </section>

        <section className="bg-white border border-[#e8e8e8] rounded-2xl p-4">
          <h2 className="font-semibold mb-1">Message the Tech</h2>
          <p className="text-sm text-[#666] mb-3">Send a request directly to {pro.name}. Your message will be emailed to their contact address.</p>

          <form onSubmit={handleSendMessage} className="space-y-2.5">
            <div className="grid sm:grid-cols-2 gap-2.5">
              <input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]"
              />
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]"
              />
            </div>
            <textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder="Hi! I'd like to book for ..."
              className="min-h-[110px] w-full rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]"
            />

            <button
              type="submit"
              disabled={sendingMessage}
              className="rounded-xl bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {sendingMessage ? 'Sending...' : 'Send Message'}
            </button>

            {messageError ? <p className="text-xs text-[#b42318]">{messageError}</p> : null}
          </form>

          <div className="mt-4 border-t border-[#f0f0f0] pt-3">
            <h3 className="text-sm font-semibold mb-2">Message Board</h3>
            {messageBoard.length === 0 ? (
              <p className="text-sm text-[#777]">No messages yet.</p>
            ) : (
              <div className="space-y-2">
                {messageBoard.map((item) => (
                  <div key={item.id} className="rounded-xl border border-[#ececec] bg-[#fafaf9] p-3">
                    <p className="text-xs text-[#777]">{item.author} • {item.email}</p>
                    <p className="text-sm text-[#444] mt-1 whitespace-pre-wrap">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {pro.gallery?.length > 0 && (
              <div className="soft-panel rounded-2xl overflow-hidden">
                <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[#1f1f1f]" />
                  <h2 className="font-semibold text-sm">Portfolio</h2>
                </div>
                <div className="grid grid-cols-3 gap-0.5">
                  {pro.gallery.map((img, i) => (
                    <div key={i} className="aspect-square overflow-hidden bg-[#f3f3f3]">
                      <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Reviews</h2>
                {session && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-xs font-semibold border border-[#ddd] px-3 py-1 rounded-lg"
                  >
                    Write review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <ReviewForm
                  professionalId={id}
                  onSuccess={(review) => {
                    setPro(prev => ({ ...prev, reviews: [review, ...prev.reviews] }))
                    setShowReviewForm(false)
                  }}
                />
              )}

              {pro.reviews?.length === 0 ? (
                <p className="text-sm text-[#777]">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {pro.reviews?.map(r => (
                    <div key={r.id} className="rounded-2xl border border-[#f0f0f0] bg-[#fafaf9] p-3.5">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="story-ring shrink-0">
                          <div className="w-9 h-9 rounded-full bg-[#1f1f1f] text-white flex items-center justify-center text-sm font-bold border border-white">
                            {r.user?.name?.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{r.user?.name}</div>
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={10} className={i < r.rating ? 'fill-[#e00707] text-[#e00707]' : 'text-[#ddd]'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-[#555] leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {(pro.phone || pro.instagram || pro.website) && (
              <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4">
                <h2 className="font-semibold mb-2">Contact</h2>
                <div className="space-y-2 text-sm text-[#666]">
                  {pro.phone && <a href={`tel:${pro.phone}`} className="inline-flex items-center gap-2"><Phone size={14} /> {pro.phone}</a>}
                  {pro.instagram && <a href={`https://instagram.com/${pro.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2"><Instagram size={14} /> @{pro.instagram}</a>}
                  {pro.website && <a href={pro.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2"><Globe size={14} /> Website</a>}
                </div>
              </div>
            )}

            {sortedHours.length > 0 && (
              <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4">
                <h2 className="font-semibold mb-2 inline-flex items-center gap-2"><Clock size={14} /> Working Hours</h2>
                <div className="space-y-1.5 text-sm">
                  {sortedHours.map(h => (
                    <div key={h.day} className="flex justify-between text-[#666]">
                      <span>{h.day}</span>
                      <span>{h.open === 'Closed' ? 'Closed' : `${h.open} – ${h.close}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
