'use client'
import { useState, useEffect, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, MapPin, Star, SlidersHorizontal, Heart } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ServiceIcons, ServiceColors } from '@/lib/serviceIcons'

const SERVICES = ['Nails', 'Hair', 'Lashes', 'Brows', 'Makeup', 'Tan']
const STYLES = ['Any', 'Natural', 'Glam', 'Bridal', 'Minimal', 'Classic', 'Bold']

function SearchContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [selectedServices, setSelectedServices] = useState(
    searchParams.get('services') ? searchParams.get('services').split(',') : []
  )
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get('maxPrice') || '500'))
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('minRating') || '0'))
  const [style, setStyle] = useState(searchParams.get('style') || 'Any')
  const [showFilters, setShowFilters] = useState(false)

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
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
          // Keep existing UI state if favorites cannot be loaded.
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

  async function fetchResults(nextFilters = {}) {
    const p = nextFilters.page ?? page
    const nextQuery = nextFilters.query ?? query
    const nextCity = nextFilters.city ?? city
    const nextServices = nextFilters.selectedServices ?? selectedServices
    const nextMaxPrice = nextFilters.maxPrice ?? maxPrice
    const nextMinRating = nextFilters.minRating ?? minRating
    const nextStyle = nextFilters.style ?? style

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (nextQuery) params.set('q', nextQuery)
      if (nextCity) params.set('city', nextCity)
      if (nextServices.length) params.set('services', nextServices.join(','))
      if (nextMaxPrice < 500) params.set('maxPrice', nextMaxPrice)
      if (nextMinRating > 0) params.set('minRating', nextMinRating)
      if (nextStyle !== 'Any') params.set('style', nextStyle)
      params.set('page', p)

      const res = await fetch(`/api/professionals?${params}`)
      const data = await res.json()
      setResults(data.professionals || [])
      setTotal(data.total || 0)
      setTotalPages(data.pages || 1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const nextQuery = searchParams.get('q') || ''
    const nextCity = searchParams.get('city') || ''
    const nextServices = searchParams.get('services')
      ? searchParams.get('services').split(',').filter(Boolean)
      : []
    const nextMaxPrice = parseInt(searchParams.get('maxPrice') || '500')
    const nextMinRating = parseFloat(searchParams.get('minRating') || '0')
    const nextStyle = searchParams.get('style') || 'Any'
    const nextPage = parseInt(searchParams.get('page') || '1')

    setQuery(nextQuery)
    setCity(nextCity)
    setSelectedServices(nextServices)
    setMaxPrice(nextMaxPrice)
    setMinRating(nextMinRating)
    setStyle(nextStyle)
    setPage(nextPage)

    fetchResults({
      page: nextPage,
      query: nextQuery,
      city: nextCity,
      selectedServices: nextServices,
      maxPrice: nextMaxPrice,
      minRating: nextMinRating,
      style: nextStyle,
    })
  }, [searchParams])

  function applyRoute(nextPage = 1) {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (city) params.set('city', city)
    if (selectedServices.length) params.set('services', selectedServices.join(','))
    if (maxPrice < 500) params.set('maxPrice', maxPrice)
    if (minRating > 0) params.set('minRating', minRating)
    if (style !== 'Any') params.set('style', style)
    params.set('page', String(nextPage))

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    applyRoute(1)
  }

  function toggleService(service) {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(x => x !== service)
        : [...prev, service]
    )
  }

  async function toggleSave(professionalId) {
    if (!session?.user) {
      const raw = localStorage.getItem('guestFavorites')
      const ids = raw ? JSON.parse(raw) : []
      const safeIds = Array.isArray(ids) ? ids : []
      const nextIds = safeIds.includes(professionalId)
        ? safeIds.filter((id) => id !== professionalId)
        : [...safeIds, professionalId]

      localStorage.setItem('guestFavorites', JSON.stringify(nextIds))
      setSaved((prev) => ({ ...prev, [professionalId]: nextIds.includes(professionalId) }))
      return
    }

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalId }),
      })
      const data = await res.json()
      if (!res.ok) return
      setSaved((prev) => ({ ...prev, [professionalId]: Boolean(data.favorited) }))
    } catch {
      // Leave the current state unchanged if save fails.
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="search" />

      <main className="page-shell">
        <div className="grid lg:grid-cols-[290px_1fr] gap-4">
          <aside className="bg-white border border-[#f0d9e3] rounded-2xl p-4 h-fit lg:sticky lg:top-24 shadow-[0_10px_24px_rgba(232,93,147,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2 rounded-lg bg-[#fff4f8] text-[var(--pink-ink)]"
              >
                <SlidersHorizontal size={14} />
              </button>
            </div>

            <form onSubmit={handleSearch} className={`space-y-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <label className="block">
                <span className="text-xs text-[#777]">Service or keyword</span>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#f0d9e3] bg-[#fff8fb] px-3 py-2.5">
                  <Search size={14} className="text-[var(--pink)]" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Nails, lashes..."
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs text-[#777]">Location</span>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#f0d9e3] bg-[#fff8fb] px-3 py-2.5">
                  <MapPin size={14} className="text-[var(--pink)]" />
                  <input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </label>

              <div>
                <p className="text-xs text-[#777] mb-2">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {SERVICES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        selectedServices.includes(s)
                          ? 'bg-[#fff1f7] text-[var(--pink-ink)] border border-[#f3d7e3]'
                          : 'bg-[#fdf7fa] text-[#555] border border-transparent'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#777]">Max Price: ${maxPrice}</label>
                <input
                  type="range"
                  min={20}
                  max={500}
                  step={10}
                  value={maxPrice}
                  onChange={e => setMaxPrice(+e.target.value)}
                  className="w-full mt-1 accent-[var(--pink)]"
                />
              </div>

              <div>
                <label className="text-xs text-[#777]">Min Rating: {minRating > 0 ? `${minRating}+` : 'Any'}</label>
                <input
                  type="range"
                  min={0}
                  max={4.5}
                  step={0.5}
                  value={minRating}
                  onChange={e => setMinRating(+e.target.value)}
                  className="w-full mt-1 accent-[var(--pink)]"
                />
              </div>

              <div>
                <label className="text-xs text-[#777]">Style</label>
                <select
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-[#f0d9e3] bg-white px-3 py-2 text-sm"
                >
                  {STYLES.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <button className="accent-cta w-full rounded-xl py-2.5 text-sm font-semibold">
                Apply filters
              </button>
            </form>
          </aside>

          <section>
            <div className="bg-white border border-[#f0d9e3] rounded-2xl p-4 mb-4 flex items-center justify-between shadow-[0_10px_24px_rgba(232,93,147,0.05)]">
              <h1 className="font-display text-2xl text-[var(--pink-ink)]">Search results</h1>
              <p className="text-sm text-[#7b7b7b]">{total} professionals</p>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-white border border-[#ececec] animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white border border-[#ececec] rounded-2xl p-10 text-center">
                <p className="font-semibold text-[#1f1f1f]">No results found</p>
                <p className="text-sm text-[#888] mt-1">Try broadening your location or service filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map(pro => {
                  const service = pro.services?.[0]
                  const Icon = ServiceIcons[service]
                  const colors = ServiceColors[service]
                  return (
                    <div key={pro.id} className="soft-panel rounded-3xl overflow-hidden fade-up">
                      <Link href={`/professionals/${pro.id}`} className="block relative">
                        <div className="h-40 bg-gradient-to-br from-[#f4f4f4] to-[#ececec] flex items-center justify-center">
                          {Icon && (
                            <div className="w-20 h-20" style={{ color: colors?.dark || '#999' }}>
                              <Icon />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="story-ring shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[#1f1f1f] text-white flex items-center justify-center text-xs font-bold border border-white">
                              {pro.name?.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/professionals/${pro.id}`}>
                              <h3 className="font-semibold text-sm truncate hover:text-[var(--pink)] transition-colors">{pro.name}</h3>
                            </Link>
                            <p className="text-[11px] text-[#888] truncate">{pro.city}, {pro.state}</p>
                          </div>
                          <button
                            onClick={() => toggleSave(pro.id)}
                            className={`heart-toggle w-8 h-8 flex items-center justify-center rounded-full transition-all ${saved[pro.id] ? 'active' : ''}`}
                            aria-label="Save professional"
                          >
                            <Heart size={14} className={saved[pro.id] ? 'heart-pop fill-[var(--pink)] text-[var(--pink)]' : 'text-[#b76b89]'} />
                          </button>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-0.5 text-xs">
                            {pro.avgRating ? (
                              <>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={10} className={i < Math.floor(pro.avgRating) ? 'fill-[var(--pink)] text-[var(--pink)]' : 'text-[#ddd]'} />
                                ))}
                                <span className="font-semibold ml-1">{pro.avgRating}</span>
                                <span className="text-[#bbb] ml-0.5">({pro.reviewCount})</span>
                              </>
                            ) : (
                              <span className="text-[#bbb]">No ratings yet</span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold bg-[#fff4f8] border border-[#f3d7e3] px-2 py-0.5 rounded-full text-[var(--pink-ink)]">${pro.priceMin}–${pro.priceMax}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {pro.services?.slice(0, 2).map(s => (
                            <span key={s} className="text-[10px] bg-[#fff8fb] text-[var(--pink-ink)] px-2 py-0.5 rounded-full border border-[#f3d7e3]">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPage(i + 1)
                      applyRoute(i + 1)
                    }}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold ${
                      page === i + 1
                        ? 'accent-cta text-white'
                        : 'bg-white border border-[#f0d9e3] text-[var(--pink-ink)]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}
