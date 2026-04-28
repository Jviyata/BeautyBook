'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Sparkles, Star, ArrowRight, Heart, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ChatBot from '@/components/ChatBot'
import { ServiceIcons, ServiceColors } from '@/lib/serviceIcons'

const CATEGORIES = ['All', 'Nails', 'Hair', 'Lashes', 'Brows', 'Makeup', 'Tan']

const STORIES = [
  { label: 'Nails', subtitle: 'Clean manicures and gel sets' },
  { label: 'Hair', subtitle: 'Cuts, color, and styling' },
  { label: 'Lashes', subtitle: 'Classic and volume sets' },
  { label: 'Brows', subtitle: 'Shaping, tinting, and lamination' },
  { label: 'Makeup', subtitle: 'Event and bridal artists' },
  { label: 'Tan', subtitle: 'Spray tan specialists' },
]

const GALLERY = [
  {
    title: 'Skin texture and glow finish',
    friend: 'Maya R.',
    tech: 'Studio Muse Makeup',
    review: 'Close-up in natural light looked smooth and even, with no heavy buildup around fine lines.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Nail detail and shape precision',
    friend: 'Jordan T.',
    tech: 'GlossLab Nails',
    review: 'Each edge is clean and symmetrical, and the top coat still has shine after daily wear.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Skin prep for makeup wear',
    friend: 'Alyssa K.',
    tech: 'Skin Ritual Studio',
    review: 'The skin looked hydrated and refined up close, which made foundation sit evenly all day.',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Hair detail and blend check',
    friend: 'Nicole S.',
    tech: 'Velvet Touch Studio',
    review: 'Section-by-section detail shows a smooth blend from root to end with a consistent tone.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80',
  },
]

const FEATURED = [
  { id: 'glosslab-nails',      name: 'GlossLab Nails',       service: 'Nails',  rating: 4.8, reviews: 34, city: 'West Lafayette, IN', price: '$45–$85',  trending: true  },
  { id: 'the-lash-lounge',     name: 'The Lash Lounge',      service: 'Lashes', rating: 4.9, reviews: 42, city: 'West Lafayette, IN', price: '$80–$200', trending: false },
  { id: 'velvet-touch-studio', name: 'Velvet Touch Studio',  service: 'Hair',   rating: 4.5, reviews: 21, city: 'Lafayette, IN',      price: '$50–$185', trending: true  },
]

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showChat, setShowChat] = useState(false)
  const [saved, setSaved] = useState({})

  useEffect(() => {
    async function loadSaved() {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/favorites')
          const data = await res.json()
          if (!res.ok || !Array.isArray(data)) return
          setSaved(Object.fromEntries(data.map((pro) => [pro.id, true])))
        } catch {
          // Keep the current state when favorites fail to load.
        }
        return
      }

      if (status === 'unauthenticated') {
        const raw = localStorage.getItem('guestFavorites')
        const ids = raw ? JSON.parse(raw) : []
        const safeIds = Array.isArray(ids) ? ids : []
        setSaved(Object.fromEntries(safeIds.map((savedId) => [savedId, true])))
      }
    }

    loadSaved()
  }, [status])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (activeCategory !== 'All') params.set('services', activeCategory)
    router.push(`/search?${params.toString()}`)
  }

  async function toggleSave(id) {
    if (!session?.user) {
      const raw = localStorage.getItem('guestFavorites')
      const ids = raw ? JSON.parse(raw) : []
      const safeIds = Array.isArray(ids) ? ids : []
      const nextIds = safeIds.includes(id)
        ? safeIds.filter((savedId) => savedId !== id)
        : [...safeIds, id]

      localStorage.setItem('guestFavorites', JSON.stringify(nextIds))
      setSaved((prev) => ({ ...prev, [id]: nextIds.includes(id) }))
      return
    }

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalId: id }),
      })
      const data = await res.json()
      if (!res.ok) return
      setSaved((prev) => ({ ...prev, [id]: Boolean(data.favorited) }))
    } catch {
      // Keep the current UI state when save fails.
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      <Navbar active="home" />

      <main className="page-shell space-y-5">
        <section
          className="relative rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] flex flex-col justify-end"
          style={{
            backgroundImage:
              "linear-gradient(160deg, rgba(15,15,15,0.75) 0%, rgba(15,15,15,0.25) 100%), url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="p-6 sm:p-10 lg:p-14 space-y-6 max-w-4xl">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-white/70 mb-2">Beauty professionals near you</p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05] max-w-3xl">Find trusted beauty services with confidence</h1>
              <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
                Discover highly rated professionals, compare services, and save the profiles that fit your style and budget.
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-3xl">
              <div className="flex-1 flex items-center gap-3 bg-white/95 backdrop-blur rounded-2xl px-5 py-4 sm:py-5 shadow-lg min-h-[64px] sm:min-h-[72px]">
                <Search size={18} className="text-[var(--pink)] shrink-0" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by service, style, or professional"
                  className="flex-1 bg-transparent outline-none text-base sm:text-lg text-[#1f1f1f] placeholder:text-[#999]"
                />
              </div>
              <button
                type="submit"
                className="accent-cta rounded-2xl px-8 py-4 sm:py-5 text-base font-semibold transition-colors min-h-[64px] sm:min-h-[72px]"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="soft-panel rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-base text-[#1f1f1f]">Browse by type</h2>
              <p className="text-sm text-[#78716c] mt-1">Explore services by specialty with quick access to each category.</p>
            </div>
            <Link href="/search" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#1f1f1f]">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {STORIES.map(({ label, subtitle }) => (
              <button
                key={label}
                onClick={() => router.push(`/search?services=${label}`)}
                className="rounded-2xl border border-[#f3d7e3] bg-white px-4 py-5 text-center hover:border-[var(--pink-pale)] hover:shadow-sm transition-all"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-[#fff4f8] border border-[#f3d7e3] flex items-center justify-center mb-4">
                  <div className="w-8 h-8 text-[var(--pink-dark)]">
                    {(() => {
                      const Icon = ServiceIcons[label]
                      return Icon ? <Icon /> : null
                    })()}
                  </div>
                </div>
                <p className="text-sm font-semibold text-[#1f1f1f]">{label}</p>
                <p className="text-xs text-[#78716c] mt-1 leading-relaxed">{subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(label => (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === label
                  ? 'bg-[#fff1f7] text-[var(--pink-ink)] border-[var(--pink-pale)] shadow-sm'
                  : 'bg-white text-[#57534e] border-[#efd9e3] hover:border-[var(--pink-pale)]'
              }`}
            >
              {label}
            </button>
          ))}
        </section>

        <section className="grid lg:grid-cols-[300px_1fr] gap-4 items-start">
          <aside className="soft-panel rounded-3xl p-4 sm:p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-base text-[#1f1f1f]">Favorite techs</h2>
              <Link href="/search" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1f1f1f]">
                See all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2.5">
              {FEATURED.map(pro => {
                const Icon = ServiceIcons[pro.service]
                const colors = ServiceColors[pro.service]
                return (
                  <Link
                    key={pro.id}
                    href={`/professionals/${pro.id}`}
                    className="block rounded-2xl border border-[#f0d9e3] bg-white p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shrink-0`}>
                        <div className="w-5 h-5" style={{ color: colors.dark }}><Icon /></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1f1f1f] truncate">{pro.name}</p>
                        <p className="text-[11px] text-[#78716c] truncate">{pro.city}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          toggleSave(pro.id)
                        }}
                        className={`heart-toggle w-8 h-8 flex items-center justify-center rounded-full transition-all ${saved[pro.id] ? 'active' : ''}`}
                        aria-label="Save profile"
                      >
                        <Heart size={14} className={`transition-all ${saved[pro.id] ? 'heart-pop fill-[var(--pink)] text-[var(--pink)]' : 'text-[#b76b89]'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#f0f0f0]">
                      <div className="flex items-center gap-0.5 text-xs">
                        <Star size={11} className="fill-[var(--pink)] text-[var(--pink)]" />
                        <span className="font-semibold">{pro.rating}</span>
                        <span className="text-[#a8a29e]">({pro.reviews})</span>
                      </div>
                      {pro.trending && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--pink-ink)] bg-[#fff4f8] border border-[#f3d7e3] rounded-full px-2 py-0.5">
                          <TrendingUp size={10} /> Recommended
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </aside>

          <div className="soft-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-base text-[#1f1f1f]">Shared detail results</h2>
                <p className="text-sm text-[#78716c] mt-1">Scrollable close-up photos for nails, skin, and hair with client notes.</p>
              </div>
              <Link href="/search" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1f1f1f]">
                Explore more <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
              {GALLERY.map(item => (
                <article
                  key={item.title}
                  className="snap-start shrink-0 w-[86vw] sm:w-[460px] lg:w-[500px] overflow-hidden rounded-3xl bg-white border border-[#e7e5e4] shadow-sm"
                >
                  <div className="relative h-[280px] sm:h-[320px] overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-full bg-white/92 backdrop-blur px-3 py-2 border border-[#e7e5e4]">
                        <div className="w-9 h-9 rounded-full bg-[#1f1f1f] text-white flex items-center justify-center text-xs font-semibold">
                          {item.friend.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#1f1f1f]">Shared by {item.friend}</p>
                          <p className="text-[11px] text-[#78716c]">Result with {item.tech}</p>
                        </div>
                      </div>
                      <div className="rounded-full bg-white/92 backdrop-blur px-2.5 py-1.5 border border-[#f3d7e3] flex items-center gap-1">
                        <Star size={12} className="fill-[var(--pink)] text-[var(--pink)]" />
                        <span className="text-xs font-semibold text-[#1f1f1f]">{item.rating}.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#1f1f1f]">{item.title}</h3>
                        <p className="text-xs text-[#78716c] mt-1">Client review</p>
                      </div>
                      <span className="text-[11px] font-medium text-[var(--pink-ink)] bg-[#fff4f8] border border-[#f3d7e3] rounded-full px-2.5 py-1">
                        {item.tech}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-[#44403c]">
                      “{item.review}”
                    </p>

                    <div className="flex items-center gap-1 pt-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={12}
                          className={index < item.rating ? 'fill-[var(--pink)] text-[var(--pink)]' : 'text-[#d6d3d1]'}
                        />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <button
            onClick={() => setShowChat(true)}
            className="accent-cta w-full flex items-center gap-3 rounded-2xl px-5 py-4 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold">Ask BeautyBot</p>
              <p className="text-xs text-white/60">Get personalised recommendations</p>
            </div>
            <ArrowRight size={16} className="text-white/60" />
          </button>
        </section>
      </main>

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
    </div>
  )
}
