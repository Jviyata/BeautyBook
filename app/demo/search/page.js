'use client'
import { useState, useEffect } from 'react'
import { Search, MapPin, Star, SlidersHorizontal, Heart } from 'lucide-react'
import Link from 'next/link'
import { ServiceIcons, ServiceColors } from '@/lib/serviceIcons'

const SERVICES = ['Nails', 'Hair', 'Lashes', 'Brows', 'Makeup', 'Tan']
const STYLES = ['Any', 'Natural', 'Glam', 'Bridal', 'Minimal', 'Classic', 'Bold']

// Sample demo data
const SAMPLE_PROFESSIONALS = [
  {
    id: '1',
    name: 'Sarah Nails Studio',
    city: 'New York',
    state: 'NY',
    services: ['Nails', 'Makeup'],
    priceMin: 35,
    priceMax: 75,
    avgRating: 4.8,
    reviewCount: 124,
    image: '/demo/sarah-nails.svg',
    bio: 'Professional nail technician with 8 years of experience.',
  },
  {
    id: '2',
    name: 'Lash Perfect',
    city: 'New York',
    state: 'NY',
    services: ['Lashes', 'Brows'],
    priceMin: 40,
    priceMax: 85,
    avgRating: 4.9,
    reviewCount: 98,
    image: '/demo/lash-perfect.svg',
    bio: 'Expert in lash extensions and brow shaping.',
  },
  {
    id: '3',
    name: 'Glam Hair Co',
    city: 'New York',
    state: 'NY',
    services: ['Hair', 'Makeup'],
    priceMin: 60,
    priceMax: 150,
    avgRating: 4.7,
    reviewCount: 156,
    image: '/demo/glam-hair.svg',
    bio: 'Award-winning hair stylist specializing in color and cuts.',
  },
  {
    id: '4',
    name: 'Tan & Glow',
    city: 'New York',
    state: 'NY',
    services: ['Tan', 'Makeup'],
    priceMin: 25,
    priceMax: 55,
    avgRating: 4.6,
    reviewCount: 87,
    image: '/demo/tan-glow.svg',
    bio: 'Professional spray tanning and cosmetic makeup services.',
  },
]

export default function DemoSearch() {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('New York')
  const [selectedServices, setSelectedServices] = useState([])
  const [maxPrice, setMaxPrice] = useState(500)
  const [minRating, setMinRating] = useState(0)
  const [style, setStyle] = useState('Any')
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState([])
  const [liked, setLiked] = useState({})

  useEffect(() => {
    filterResults()
  }, [query, city, selectedServices, maxPrice, minRating, style])

  function filterResults() {
    let filtered = SAMPLE_PROFESSIONALS

    // Filter by query
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.bio.toLowerCase().includes(query.toLowerCase()) ||
          p.services.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      )
    }

    // Filter by services
    if (selectedServices.length > 0) {
      filtered = filtered.filter((p) =>
        selectedServices.some((s) => p.services.includes(s))
      )
    }

    // Filter by price
    filtered = filtered.filter((p) => p.priceMin <= maxPrice)

    // Filter by rating
    filtered = filtered.filter((p) => p.avgRating >= minRating)

    setResults(filtered)
  }

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    )
  }

  return (
    <div className="min-h-screen bg-[#fdf6f9]">
      {/* Header */}
      <div className="bg-white border-b border-[#F4C0D1] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/demo" className="text-[#D4537E] hover:underline text-sm font-medium">
              ← Back to Demo
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-[#2C1A23] mb-4">Find Beauty Professionals</h1>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba0ab]" size={18} />
              <input
                type="text"
                placeholder="Search by name or service..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm outline-none focus:border-[#D4537E]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-[#FBEAF0] border border-[#F4C0D1] rounded-xl hover:bg-[#F4C0D1] transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal size={16} className="text-[#D4537E]" />
              <span className="text-xs font-medium text-[#2C1A23]">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-[#F4C0D1] p-4 space-y-4 sticky top-24">
                {/* Services */}
                <div>
                  <h3 className="text-xs font-semibold text-[#2C1A23] uppercase tracking-wide mb-2">Services</h3>
                  <div className="space-y-2">
                    {SERVICES.map((service) => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service)}
                          onChange={() => toggleService(service)}
                          className="w-4 h-4 rounded border-[#F4C0D1]"
                        />
                        <span className="text-xs text-[#7a5a67]">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-xs font-semibold text-[#2C1A23] uppercase tracking-wide mb-2">Max Price</h3>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-[#7a5a67] mt-1">${maxPrice}</p>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="text-xs font-semibold text-[#2C1A23] uppercase tracking-wide mb-2">Min Rating</h3>
                  <div className="flex gap-1">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`px-2 py-1 text-xs rounded border ${
                          minRating === rating
                            ? 'bg-[#D4537E] text-white border-[#D4537E]'
                            : 'bg-[#fdf6f9] border-[#F4C0D1] text-[#7a5a67]'
                        }`}
                      >
                        {rating === 0 ? 'Any' : rating + '+'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="mb-4 text-sm text-[#7a5a67]">
              Found {results.length} professional{results.length !== 1 ? 's' : ''}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#bba0ab]">No professionals match your filters. Try adjusting your search.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 space-y-4">
                {results.map((professional) => (
                  <Link
                    key={professional.id}
                    href={`/demo/professionals/${professional.id}`}
                    className="group bg-white rounded-2xl border border-[#F4C0D1] overflow-hidden hover:border-[#D4537E] transition-colors"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-[#FBEAF0] to-[#F4C0D1] overflow-hidden">
                      {professional.image && (
                        <img
                          src={professional.image}
                          alt={professional.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <button
  type="button"
  onClick={(e) => {
    e.preventDefault()
    setLiked((prev) => ({
      ...prev,
      [professional.id]: !prev[professional.id],
    }))
  }}
  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 border border-[#F4C0D1] flex items-center justify-center shadow-sm"
  aria-label="Like professional"
>
  <Heart
    size={19}
    className={
      liked[professional.id]
        ? 'fill-[#D4537E] text-[#D4537E]'
        : 'text-[#D4537E]'
    }
  />
</button>

                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-[#2C1A23] mb-2 group-hover:text-[#D4537E] transition-colors">
                        {professional.name}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-[#7a5a67] mb-3">
                        <MapPin size={14} />
                        <span>
                          {professional.city}, {professional.state}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={`${
                                i < Math.floor(professional.avgRating)
                                  ? 'fill-[#D4537E] text-[#D4537E]'
                                  : 'text-[#F4C0D1]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-[#2C1A23]">
                          {professional.avgRating} ({professional.reviewCount})
                        </span>
                      </div>

                      {/* Services */}
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {professional.services.slice(0, 2).map((service) => (
                          <span
                            key={service}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: ServiceColors[service]?.light || '#FBEAF0',
                              color: ServiceColors[service]?.dark || '#D4537E',
                            }}
                          >
                            {service}
                          </span>
                        ))}
                        {professional.services.length > 2 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-[#FBEAF0] text-[#D4537E]">
                            +{professional.services.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-xs text-[#7a5a67]">
                        ${professional.priceMin} - ${professional.priceMax}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center bg-[#FBEAF0] rounded-3xl p-8 border border-[#F4C0D1]">
          <h3 className="text-xl font-semibold text-[#2C1A23] mb-3">Want to Save Your Favorites?</h3>
          <p className="text-[#7a5a67] mb-6">Create a free account to save professionals, leave reviews, and book appointments.</p>
          <Link
            href="/register"
            className="inline-block bg-[#D4537E] text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
