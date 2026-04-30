'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Star, MapPin, Phone, Instagram, Globe, Heart, ArrowLeft, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ReviewForm from '@/components/ReviewForm'

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function toLocalDateValue(date = new Date()) {
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
  return localDate.toISOString().slice(0, 10)
}

function toLocalTimeValue(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function parseTimeLabel(value) {
  if (!value || value === 'Closed') return null

  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null

  let hours = Number(match[1]) % 12
  const minutes = Number(match[2])
  const meridiem = match[3].toUpperCase()

  if (meridiem === 'PM') hours += 12

  return { hours, minutes }
}

function formatTimeValue(value) {
  const parsed = parseTimeLabel(value)
  if (!parsed) return ''
  return `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`
}

function getDayName(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return DAY_ORDER[date.getDay() === 0 ? 6 : date.getDay() - 1]
}

function getHoursForDate(hours, dateValue) {
  if (!dateValue) return null
  const dayName = getDayName(dateValue)
  return hours.find((entry) => entry.day === dayName) || null
}

function combineLocalDateAndTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null
  const [year, month, day] = dateValue.split('-').map(Number)
  const [hours, minutes] = timeValue.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

function isWithinHours(dateValue, timeValue, hoursEntry) {
  if (!hoursEntry || hoursEntry.open === 'Closed') return false

  const selectedDate = combineLocalDateAndTime(dateValue, timeValue)
  const openTime = combineLocalDateAndTime(dateValue, formatTimeValue(hoursEntry.open))
  const closeTime = combineLocalDateAndTime(dateValue, formatTimeValue(hoursEntry.close))

  if (!selectedDate || !openTime || !closeTime) return false

  return selectedDate.getTime() >= openTime.getTime() && selectedDate.getTime() <= closeTime.getTime()
}

function maxTimeValue(first, second) {
  if (!first) return second
  if (!second) return first
  return first > second ? first : second
}

function toExampleInstagramHandle(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export default function ProfessionalPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [conversationLoading, setConversationLoading] = useState(false)
  const [messageDraft, setMessageDraft] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingDay, setBookingDay] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false)

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
    if (!session?.user || session.user.role !== 'USER') {
      setConversation(null)
      return
    }

    let cancelled = false
    setConversationLoading(true)

    fetch(`/api/messages?professionalId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setConversation(data?.conversation || null)
      })
      .catch(() => {
        if (cancelled) return
        setMessageError('Could not load this conversation.')
      })
      .finally(() => {
        if (!cancelled) setConversationLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, session?.user])

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

    if (!session?.user) {
      router.push('/login')
      return
    }

    if (session.user.role !== 'USER') {
      setMessageError('Technicians can manage conversations from the dashboard inbox.')
      return
    }

    if (!messageDraft.trim()) {
      setMessageError('Please enter a message.')
      return
    }

    setSendingMessage(true)

    try {
      const res = await fetch(conversation ? `/api/messages/${conversation.id}` : '/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          conversation
            ? { body: messageDraft.trim() }
            : { professionalId: id, body: messageDraft.trim() },
        ),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessageError(data?.error || 'Could not send message.')
        setSendingMessage(false)
        return
      }

      setConversation(data.conversation)
      setChatOpen(true)
      setMessageDraft('')
    } catch {
      setMessageError('Could not send message.')
    } finally {
      setSendingMessage(false)
    }
  }

  async function handleRequestBooking(e) {
    e.preventDefault()
    setBookingError('')

    if (!session?.user) {
      router.push('/login')
      return
    }

    if (!bookingDay || !bookingTime) {
      setBookingError('Please choose an appointment date and time.')
      return
    }

    const hoursForDate = getHoursForDate(pro.hours || [], bookingDay)
    if (!hoursForDate || hoursForDate.open === 'Closed') {
      setBookingError('This technician is closed on the selected day.')
      return
    }

    if (!isWithinHours(bookingDay, bookingTime, hoursForDate)) {
      setBookingError(`Please choose a time between ${hoursForDate.open} and ${hoursForDate.close}.`)
      return
    }

    const date = combineLocalDateAndTime(bookingDay, bookingTime)
    if (Number.isNaN(date.getTime())) {
      setBookingError('Please choose a valid appointment date and time.')
      return
    }

    if (date.getTime() < Date.now()) {
      setBookingError('Appointments cannot be scheduled in the past.')
      return
    }

    setBookingLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: id,
          date: date.toISOString(),
          notes: bookingNotes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBookingError(data?.error || 'Could not create booking.')
        return
      }
      setShowBookingSuccessModal(true)
      setBookingDay('')
      setBookingTime('')
      setBookingNotes('')
    } catch {
      setBookingError('Could not create booking.')
    } finally {
      setBookingLoading(false)
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
  const hoursForSelectedDate = getHoursForDate(sortedHours, bookingDay)
  const selectedDayIsClosed = bookingDay && (!hoursForSelectedDate || hoursForSelectedDate.open === 'Closed')
  const isToday = bookingDay === toLocalDateValue()
  const earliestTime = hoursForSelectedDate
    ? maxTimeValue(formatTimeValue(hoursForSelectedDate.open), isToday ? toLocalTimeValue() : '')
    : ''
  const latestTime = hoursForSelectedDate ? formatTimeValue(hoursForSelectedDate.close) : ''
  const noTimesRemaining = Boolean(earliestTime && latestTime && earliestTime > latestTime)
  const activeDayName = bookingDay ? getDayName(bookingDay) : DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const activeHours = bookingDay ? hoursForSelectedDate : getHoursForDate(sortedHours, toLocalDateValue())
  const instagramHandle = pro.instagram || toExampleInstagramHandle(pro.name)
  const instagramHref = `https://instagram.com/${instagramHandle}`
  const displayRating = typeof pro.avgRating === 'number' ? pro.avgRating.toFixed(1) : null

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="search" />

      <main className="page-shell space-y-4 pb-32 md:pb-28">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-[#555] hover:text-[#1f1f1f]"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <section className="soft-panel rounded-3xl overflow-visible">
          <div className="h-44 overflow-hidden rounded-t-3xl bg-gradient-to-br from-stone-100 via-neutral-50 to-stone-200 relative">
            {pro.image && (
              <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="relative px-5 pb-5">
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
                      ? 'bg-[var(--pink)] text-white border-[var(--pink)] shadow-[0_10px_18px_rgba(232,93,147,0.22)]'
                      : 'bg-white text-[var(--pink-ink)] border-[#f0d9e3] hover:border-[var(--pink-pale)]'
                  }`}
                >
                  <Heart size={14} className={favorited ? 'fill-white text-white' : 'text-[var(--pink)]'} />
                  {favorited ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <h1 className="font-display text-2xl leading-tight">{pro.name}</h1>
            <p className="mt-0.5 text-sm text-[#666] inline-flex items-center gap-1">
              <MapPin size={12} /> {pro.city}, {pro.state}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {pro.phone && (
                <a
                  href={`tel:${pro.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#f3d7e3] bg-[#fff8fb] px-3 py-1.5 text-[var(--pink-ink)]"
                >
                  <Phone size={12} /> {pro.phone}
                </a>
              )}
              <a
                href={instagramHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#f3d7e3] bg-[#fff8fb] px-3 py-1.5 text-[var(--pink-ink)]"
              >
                <Instagram size={12} /> @{instagramHandle}
              </a>
              {pro.website && (
                <a
                  href={pro.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#f3d7e3] bg-[#fff8fb] px-3 py-1.5 text-[var(--pink-ink)]"
                >
                  <Globe size={12} /> Website
                </a>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#f0f0f0] pt-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(pro.avgRating || 0) ? 'fill-[var(--pink)] text-[var(--pink)]' : 'text-[#ddd]'}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-base font-semibold text-[#1f1f1f]">{displayRating || 'New'}</p>
                  <p className="text-[11px] text-[var(--pink-ink)]">{pro.reviewCount || 0} reviews</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#f3d7e3] bg-[#fff4f8] px-3 py-1 text-xs font-medium text-[var(--pink-ink)]">
                  ${pro.priceMin}–${pro.priceMax}
                </span>
                {pro.gallery?.length > 0 && (
                  <span className="rounded-full border border-[#f3d7e3] bg-[#fff4f8] px-3 py-1 text-xs font-medium text-[var(--pink-ink)]">
                    {pro.gallery.length} posts
                  </span>
                )}
              </div>
            </div>

            {pro.bio && <p className="text-sm text-[#666] mt-3 leading-relaxed">{pro.bio}</p>}

            <div className="flex flex-wrap gap-1.5 mt-3">
              {pro.services?.map(s => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-[#fff4f8] border border-[#f3d7e3] text-[var(--pink-ink)]">{s}</span>
              ))}
            </div>

            <form onSubmit={handleRequestBooking} className="mt-4 space-y-3 rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-4">
              {sortedHours.length > 0 && (
                <div className="rounded-2xl border border-[#f3d7e3] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold inline-flex items-center gap-2 text-sm text-[#1f1f1f]">
                      <Clock size={14} className="text-[var(--pink)]" /> Book Within Working Hours
                    </h2>
                    <span className="text-[11px] font-medium text-[var(--pink-ink)] bg-[#fff4f8] border border-[#f3d7e3] rounded-full px-2.5 py-1">
                      {activeDayName}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#7a5a67]">
                    {activeHours?.open === 'Closed'
                      ? `${activeDayName} is closed.`
                      : activeHours
                        ? `${activeDayName} hours: ${activeHours.open} - ${activeHours.close}.`
                        : 'Choose a date to see that day’s booking window.'}
                  </p>
                  <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {sortedHours.map((h) => {
                      const isActive = h.day === activeDayName
                      return (
                        <div
                          key={h.day}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                            isActive
                              ? 'border-[#f3d7e3] bg-[#fff4f8] text-[var(--pink-ink)]'
                              : 'border-[#f0f0f0] bg-[#fcfcfc] text-[#666]'
                          }`}
                        >
                          <span className="font-medium">{h.day}</span>
                          <span>{h.open === 'Closed' ? 'Closed' : `${h.open} - ${h.close}`}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="booking-date" className="mb-1.5 block text-sm font-semibold text-[#1f1f1f]">
                  Appointment date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={bookingDay}
                  min={toLocalDateValue()}
                  onChange={(e) => {
                    setBookingDay(e.target.value)
                    setBookingTime('')
                  }}
                  className="w-full rounded-xl border border-[#e7e5e4] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]"
                />
                <p className="mt-1 text-xs text-[#777]">Pick a future day from the calendar.</p>
              </div>

              <div>
                <label htmlFor="booking-time" className="mb-1.5 block text-sm font-semibold text-[#1f1f1f]">
                  Appointment time
                </label>
                <input
                  id="booking-time"
                  type="time"
                  value={bookingTime}
                  min={!noTimesRemaining ? earliestTime || undefined : undefined}
                  max={latestTime || undefined}
                  step={900}
                  disabled={!bookingDay || selectedDayIsClosed || noTimesRemaining}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full rounded-xl border border-[#e7e5e4] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f1f1f] disabled:bg-[#f4f1f2] disabled:text-[#9b8f95]"
                />
                <p className="mt-1 text-xs text-[#777]">
                  {!bookingDay && 'Choose a date first to see available hours.'}
                  {bookingDay && selectedDayIsClosed && 'This technician is closed on that day.'}
                  {bookingDay && !selectedDayIsClosed && noTimesRemaining && 'No appointment times remain for that day.'}
                  {bookingDay && !selectedDayIsClosed && !noTimesRemaining && `Available from ${hoursForSelectedDate.open} to ${hoursForSelectedDate.close}.`}
                </p>
              </div>

              <div>
                <label htmlFor="booking-notes" className="mb-1.5 block text-sm font-semibold text-[#1f1f1f]">
                  Notes for the technician
                </label>
                <textarea
                  id="booking-notes"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Service details, preferred look, or anything else they should know."
                  className="min-h-[96px] w-full rounded-xl border border-[#e7e5e4] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="accent-cta w-full rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {bookingLoading ? 'Requesting...' : 'Request Booking'}
              </button>

              {bookingError ? <p className="text-xs text-[#b42318]">{bookingError}</p> : null}
            </form>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-4">
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
        </section>
      </main>



      {showBookingSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1a23]/40 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#f0d9e3] bg-white p-5 shadow-[0_24px_60px_rgba(44,26,35,0.18)]">
            <h2 className="text-lg font-semibold text-[#1f1f1f]">Appointment Request Sent</h2>
            <p className="mt-2 text-sm text-[#666]">Your request was submitted successfully. You can review it anytime from Profile → Calendar.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowBookingSuccessModal(false)}
                className="flex-1 rounded-xl border border-[#f0d9e3] px-4 py-2 text-sm font-semibold text-[var(--pink-ink)]"
              >
                Keep browsing
              </button>
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="flex-1 rounded-xl bg-[var(--pink)] px-4 py-2 text-sm font-semibold text-white"
              >
                View calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
