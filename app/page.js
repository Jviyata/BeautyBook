'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Sparkles, Star, ArrowRight, Heart, TrendingUp, ChevronLeft, ChevronRight, MessageCircle, Share2 } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ChatBot from '@/components/ChatBot'
import { ServiceIcons, ServiceColors } from '@/lib/serviceIcons'
import { CATEGORIES, STORIES, GALLERY, FEATURED } from '@/lib/homePageData'

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showChat, setShowChat] = useState(false)
  const [saved, setSaved] = useState({})
  const [likes, setLikes] = useState({})
  const galleryRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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

  // Initialize likes from localStorage
  useEffect(() => {
    const storedLikes = localStorage.getItem('reviewLikes')
    if (storedLikes) {
      setLikes(JSON.parse(storedLikes))
    }
  }, [])

  // Check scroll position on gallery
  useEffect(() => {
    const checkScroll = () => {
      if (galleryRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = galleryRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }

    checkScroll()
    const container = galleryRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

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

  function toggleLike(title) {
    setLikes((prev) => {
      const updated = { ...prev, [title]: !prev[title] }
      localStorage.setItem('reviewLikes', JSON.stringify(updated))
      return updated
    })
  }

  function scroll(direction) {
    if (galleryRef.current) {
      const scrollAmount = 320
      galleryRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      <Navbar active="home" />

      <main className="page-shell space-y-5">
        <section
          className="relative rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[560px] flex flex-col justify-end"
          style={{
            backgroundImage:
              "linear-gradient(160deg, rgba(15,15,15,0.75) 0%, rgba(15,15,15,0.25) 100%), url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="p-4 sm:p-8 lg:p-14 space-y-4 sm:space-y-6 max-w-4xl">
            <div>
              <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-white/70 mb-2">Beauty professionals near you</p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05] max-w-3xl">Find trusted beauty services with confidence</h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-white/80 max-w-2xl leading-relaxed">
                Discover highly rated professionals, compare services, and save the profiles that fit your style and budget.
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-3xl">
              <div className="flex-1 flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-lg min-h-[56px] sm:min-h-[64px]">
                <Search size={16} className="text-[var(--pink)] shrink-0 sm:w-[18px]" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by service or professional"
                  className="flex-1 bg-transparent outline-none text-sm sm:text-base text-[#1f1f1f] placeholder:text-[#999]"
                />
              </div>
              <button
                type="submit"
                className="accent-cta rounded-2xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors min-h-[56px] sm:min-h-[64px]"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="soft-panel rounded-3xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-base text-[#1f1f1f]">Browse by type</h2>
              <p className="text-xs sm:text-sm text-[#78716c] mt-1">Explore services by specialty.</p>
            </div>
            <Link href="/search" className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1f1f1f] shrink-0">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {STORIES.map(({ label, subtitle }) => (
              <button
                key={label}
                onClick={() => router.push(`/search?services=${label}`)}
                className="rounded-2xl border border-[#f3d7e3] bg-white px-3 sm:px-4 py-4 sm:py-5 text-center hover:border-[var(--pink-pale)] hover:shadow-sm transition-all"
              >
                <div className="w-14 sm:w-16 h-14 sm:h-16 mx-auto rounded-full bg-[#fff4f8] border border-[#f3d7e3] flex items-center justify-center mb-3 sm:mb-4">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 text-[var(--pink-dark)]">
                    {(() => {
                      const Icon = ServiceIcons[label]
                      return Icon ? <Icon /> : null
                    })()}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#1f1f1f]">{label}</p>
                <p className="text-[11px] sm:text-xs text-[#78716c] mt-1 leading-tight hidden sm:block">{subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="flex gap-2 overflow-x-auto no-scrollbar px-2 -mx-2">
          {CATEGORIES.map(label => (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                activeCategory === label
                  ? 'bg-[#fff1f7] text-[var(--pink-ink)] border-[var(--pink-pale)] shadow-sm'
                  : 'bg-white text-[#57534e] border-[#efd9e3] hover:border-[var(--pink-pale)]'
              }`}
            >
              {label}
            </button>
          ))}
        </section>

        <section className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-4 lg:items-start space-y-4 lg:space-y-0">
          <aside className="soft-panel rounded-3xl p-4 sm:p-5 lg:sticky lg:top-24 order-last lg:order-first">
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

          <div className="soft-panel rounded-3xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-base text-[#1f1f1f]">Shared detail results</h2>
                <p className="text-xs sm:text-sm text-[#78716c] mt-1">Scrollable close-up photos with client reviews.</p>
              </div>
              <Link href="/search" className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#1f1f1f] shrink-0">
                Explore more <ArrowRight size={12} />
              </Link>
            </div>

            <div className="relative">
              {/* Scroll Buttons */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 sm:-ml-3 z-10 bg-white/95 backdrop-blur border border-[#e7e5e4] rounded-full p-2 shadow-md hover:shadow-lg transition-all hidden sm:flex items-center justify-center"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} className="text-[#1f1f1f]" />
                </button>
              )}

              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 sm:-mr-3 z-10 bg-white/95 backdrop-blur border border-[#e7e5e4] rounded-full p-2 shadow-md hover:shadow-lg transition-all hidden sm:flex items-center justify-center"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} className="text-[#1f1f1f]" />
                </button>
              )}

              {/* Gallery Container */}
              <div
                ref={galleryRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth px-2 sm:px-4 -mx-2 sm:-mx-4 pb-2"
              >
                {GALLERY.map(item => (
                  <article
                    key={item.title}
                    className="flex-shrink-0 w-[280px] sm:w-[300px] group overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-[#e7e5e4] hover:border-[var(--pink-pale)] shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-[#f5f5f4]">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      
                      {/* Rating Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex flex-col items-end justify-start p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="rounded-full bg-white/95 backdrop-blur px-2.5 py-1.5 border border-[#f3d7e3] flex items-center gap-1">
                          <Star size={12} className="fill-[var(--pink)] text-[var(--pink)]" />
                          <span className="text-xs font-semibold text-[#1f1f1f]">{item.rating}.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Style Content */}
                    <div className="p-3 sm:p-4 space-y-3">
                      {/* Header with avatar and tech name */}
                      <div className="flex items-center gap-2.5 pb-2 border-b border-[#f0f0f0]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pink-light)] to-[var(--pink-pale)] flex items-center justify-center text-sm font-bold text-[var(--pink-ink)] shrink-0">
                          {item.friend.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1f1f1f] truncate">{item.friend}</p>
                          <p className="text-xs text-[#a8a29e]">via {item.tech}</p>
                        </div>
                      </div>

                      {/* Title and Review */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#1f1f1f] mb-2">{item.title}</h3>
                        <p className="text-xs leading-relaxed text-[#57534e]">
                          "{item.review}"
                        </p>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 pt-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={12}
                            className={index < item.rating ? 'fill-[var(--pink)] text-[var(--pink)]' : 'text-[#d6d3d1]'}
                          />
                        ))}
                      </div>

                      {/* Social Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#f0f0f0]">
                        <button
                          onClick={() => toggleLike(item.title)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
                            likes[item.title]
                              ? 'bg-[#fff4f8] text-[var(--pink)]'
                              : 'bg-[#f5f5f4] text-[#78716c] hover:bg-[#eee]'
                          }`}
                        >
                          <Heart
                            size={14}
                            className={likes[item.title] ? 'fill-current' : ''}
                          />
                          <span className="text-xs font-medium">Like</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#f5f5f4] text-[#78716c] hover:bg-[#eee] transition-colors">
                          <MessageCircle size={14} />
                          <span className="text-xs font-medium">Reply</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#f5f5f4] text-[#78716c] hover:bg-[#eee] transition-colors">
                          <Share2 size={14} />
                          <span className="text-xs font-medium">Share</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Mobile scroll indicator */}
              <div className="flex items-center justify-center gap-1 mt-3 sm:hidden">
                <div className="text-xs text-[#a8a29e]">← Swipe to explore →</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <button
            onClick={() => setShowChat(true)}
            className="accent-cta w-full flex items-center gap-3 rounded-2xl px-4 sm:px-5 py-4 transition-colors"
          >
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
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
