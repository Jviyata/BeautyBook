'use client'
import Link from 'next/link'
import { Star, MapPin, Phone, Heart, MessageCircle, Calendar } from 'lucide-react'
import { useState } from 'react'

// Sample professional data
const DEMO_PROFESSIONALS = {
  '1': {
    id: '1',
    name: 'Sarah Nails Studio',
    bio: 'Professional nail technician with 8 years of experience in gel, acrylic, and natural nails.',
    city: 'New York',
    state: 'NY',
    services: ['Nails', 'Makeup'],
    priceMin: 35,
    priceMax: 75,
    avgRating: 4.8,
    reviewCount: 124,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop',
    phone: '(555) 123-4567',
    website: 'www.sarahnails.com',
    instagram: '@sarahnailsstudio',
    gallery: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
    ],
    hours: [
      { day: 'Monday', open: '10:00 AM', close: '7:00 PM' },
      { day: 'Tuesday', open: '10:00 AM', close: '7:00 PM' },
      { day: 'Wednesday', open: '10:00 AM', close: '7:00 PM' },
      { day: 'Thursday', open: '10:00 AM', close: '8:00 PM' },
      { day: 'Friday', open: '10:00 AM', close: '8:00 PM' },
      { day: 'Saturday', open: '9:00 AM', close: '6:00 PM' },
      { day: 'Sunday', open: 'Closed', close: '' },
    ],
    reviews: [
      {
        id: '1',
        author: 'Jennifer D.',
        rating: 5,
        text: 'Amazing work! Sarah is very attentive to detail and professional. Highly recommend!',
        date: '2 weeks ago',
      },
      {
        id: '2',
        author: 'Michelle K.',
        rating: 5,
        text: 'Great experience. Clean studio and talented artist. Will definitely come back.',
        date: '1 month ago',
      },
      {
        id: '3',
        author: 'Lisa M.',
        rating: 4,
        text: 'Good work, a bit pricey but worth it for the quality.',
        date: '1 month ago',
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Lash Perfect',
    bio: 'Certified lash and brow specialist focused on natural and glam looks with long-lasting retention.',
    city: 'New York',
    state: 'NY',
    services: ['Lashes', 'Brows'],
    priceMin: 40,
    priceMax: 85,
    avgRating: 4.9,
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=600&h=600&fit=crop',
    phone: '(555) 222-6677',
    website: 'www.lashperfectny.com',
    instagram: '@lashperfectny',
    gallery: [
      'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1596704017254-9759d0c0f915?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
    ],
    hours: [
      { day: 'Monday', open: '11:00 AM', close: '7:00 PM' },
      { day: 'Tuesday', open: '11:00 AM', close: '7:00 PM' },
      { day: 'Wednesday', open: '11:00 AM', close: '7:00 PM' },
      { day: 'Thursday', open: '11:00 AM', close: '8:00 PM' },
      { day: 'Friday', open: '11:00 AM', close: '8:00 PM' },
      { day: 'Saturday', open: '10:00 AM', close: '6:00 PM' },
      { day: 'Sunday', open: 'Closed', close: '' },
    ],
    reviews: [
      {
        id: '1',
        author: 'Ariana P.',
        rating: 5,
        text: 'Best lash retention I have had in NYC. Super clean and relaxing.',
        date: '1 week ago',
      },
      {
        id: '2',
        author: 'Sophie R.',
        rating: 5,
        text: 'My brows look amazing every time. Highly recommend!',
        date: '3 weeks ago',
      },
    ],
  },
  '3': {
    id: '3',
    name: 'Glam Hair Co',
    bio: 'Award-winning hair stylist specializing in color transformations, blowouts, and healthy hair routines.',
    city: 'New York',
    state: 'NY',
    services: ['Hair', 'Makeup'],
    priceMin: 60,
    priceMax: 150,
    avgRating: 4.7,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=600&fit=crop',
    phone: '(555) 990-3400',
    website: 'www.glamhairco.com',
    instagram: '@glamhairco',
    gallery: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop',
    ],
    hours: [
      { day: 'Monday', open: '10:00 AM', close: '6:00 PM' },
      { day: 'Tuesday', open: '10:00 AM', close: '7:00 PM' },
      { day: 'Wednesday', open: '10:00 AM', close: '7:00 PM' },
      { day: 'Thursday', open: '10:00 AM', close: '8:00 PM' },
      { day: 'Friday', open: '10:00 AM', close: '8:00 PM' },
      { day: 'Saturday', open: '9:00 AM', close: '6:00 PM' },
      { day: 'Sunday', open: 'Closed', close: '' },
    ],
    reviews: [
      {
        id: '1',
        author: 'Danielle V.',
        rating: 5,
        text: 'Color came out perfect and my hair still feels healthy!',
        date: '5 days ago',
      },
      {
        id: '2',
        author: 'Mia C.',
        rating: 4,
        text: 'Great styling and consultation. Friendly team.',
        date: '2 weeks ago',
      },
    ],
  },
  '4': {
    id: '4',
    name: 'Tan & Glow',
    bio: 'Custom spray tans and event-ready makeup with skin-safe products and natural finishes.',
    city: 'New York',
    state: 'NY',
    services: ['Tan', 'Makeup'],
    priceMin: 25,
    priceMax: 55,
    avgRating: 4.6,
    reviewCount: 87,
    image: 'https://images.unsplash.com/photo-1570158268183-d296b2892211?w=600&h=600&fit=crop',
    phone: '(555) 700-1122',
    website: 'www.tanandglow.com',
    instagram: '@tanandglow',
    gallery: [
      'https://images.unsplash.com/photo-1570158268183-d296b2892211?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
    ],
    hours: [
      { day: 'Monday', open: '10:00 AM', close: '6:00 PM' },
      { day: 'Tuesday', open: '10:00 AM', close: '6:00 PM' },
      { day: 'Wednesday', open: '10:00 AM', close: '6:00 PM' },
      { day: 'Thursday', open: '10:00 AM', close: '7:00 PM' },
      { day: 'Friday', open: '10:00 AM', close: '7:00 PM' },
      { day: 'Saturday', open: '9:00 AM', close: '5:00 PM' },
      { day: 'Sunday', open: 'Closed', close: '' },
    ],
    reviews: [
      {
        id: '1',
        author: 'Kelsey N.',
        rating: 5,
        text: 'Natural tan every time. No orange tones at all.',
        date: '6 days ago',
      },
      {
        id: '2',
        author: 'Brooke T.',
        rating: 4,
        text: 'Quick appointment and great finish for events.',
        date: '3 weeks ago',
      },
    ],
  },
}

export default function DemoProfessionalDetail({ params }) {
  const professional = DEMO_PROFESSIONALS[params.id]
  const [saved, setSaved] = useState(false)

  if (!professional) {
    return (
      <div className="min-h-screen bg-[#fdf6f9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#7a5a67] mb-4">Professional not found in demo</p>
          <Link href="/demo/search" className="text-[#D4537E] font-medium hover:underline">
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdf6f9]">
      {/* Header */}
      <div className="bg-white border-b border-[#F4C0D1]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/demo/search" className="text-[#D4537E] hover:underline text-sm font-medium">
            ← Back to Search
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-[#F4C0D1] p-6 sticky top-4">
              {/* Image */}
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-4">
                <img
                  src={professional.image}
                  alt={professional.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <h1 className="text-xl font-semibold text-[#2C1A23] mb-2">{professional.name}</h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-[#7a5a67] mb-4">
                <MapPin size={16} />
                <span>
                  {professional.city}, {professional.state}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#F4C0D1]">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(professional.avgRating)
                          ? 'fill-[#D4537E] text-[#D4537E]'
                          : 'text-[#F4C0D1]'
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-medium text-[#2C1A23]">{professional.avgRating}</p>
                  <p className="text-xs text-[#bba0ab]">{professional.reviewCount} reviews</p>
                </div>
              </div>

              {/* Contact Info */}
              {professional.phone && (
                <div className="mb-4">
                  <p className="text-xs text-[#bba0ab] uppercase tracking-wider mb-1">Phone</p>
                  <a href={`tel:${professional.phone}`} className="text-sm text-[#D4537E] hover:underline font-medium">
                    {professional.phone}
                  </a>
                </div>
              )}

              {professional.website && (
                <div className="mb-4">
                  <p className="text-xs text-[#bba0ab] uppercase tracking-wider mb-1">Website</p>
                  <a href={`https://${professional.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#D4537E] hover:underline font-medium">
                    Visit Website
                  </a>
                </div>
              )}

              {professional.instagram && (
                <div className="mb-6">
                  <p className="text-xs text-[#bba0ab] uppercase tracking-wider mb-1">Instagram</p>
                  <a href={`https://instagram.com/${professional.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#D4537E] hover:underline font-medium">
                    {professional.instagram}
                  </a>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setSaved(!saved)}
                  className="w-full px-4 py-3 rounded-xl border border-[#F4C0D1] text-[#D4537E] font-medium hover:bg-[#FBEAF0] transition-colors flex items-center justify-center gap-2"
                >
                  <Heart size={18} className={saved ? 'fill-[#D4537E]' : ''} />
                  {saved ? 'Saved' : 'Save'}
                </button>
                <button
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-[#E8C7D5] text-white font-medium cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Message
                </button>
                <Link
                  href="/register"
                  className="w-full px-4 py-3 rounded-xl bg-[#D4537E] text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  Book
                </Link>
              </div>

              {/* Note */}
              <p className="text-xs text-[#bba0ab] text-center mt-4">
                Create an account to message and book.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl border border-[#F4C0D1] p-6">
              <h2 className="text-lg font-semibold text-[#2C1A23] mb-3">About</h2>
              <p className="text-[#7a5a67]">{professional.bio}</p>
            </div>

            {/* Services & Price */}
            <div className="bg-white rounded-2xl border border-[#F4C0D1] p-6">
              <h2 className="text-lg font-semibold text-[#2C1A23] mb-3">Services</h2>
              <div className="space-y-3">
                {professional.services.map((service) => (
                  <div key={service} className="flex justify-between items-center pb-2 border-b border-[#F4C0D1]">
                    <span className="text-[#7a5a67]">{service}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#F4C0D1]">
                <p className="text-sm text-[#7a5a67]">
                  Price Range: <span className="font-medium text-[#2C1A23]">${professional.priceMin} - ${professional.priceMax}</span>
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl border border-[#F4C0D1] p-6">
              <h2 className="text-lg font-semibold text-[#2C1A23] mb-3">Hours</h2>
              <div className="space-y-2">
                {professional.hours.map((hour) => (
                  <div key={hour.day} className="flex justify-between items-center text-sm">
                    <span className="text-[#7a5a67]">{hour.day}</span>
                    <span className="text-[#2C1A23] font-medium">
                      {hour.open === 'Closed' ? 'Closed' : `${hour.open} - ${hour.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {professional.gallery && professional.gallery.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#F4C0D1] p-6">
                <h2 className="text-lg font-semibold text-[#2C1A23] mb-4">Gallery</h2>
                <div className="grid grid-cols-3 gap-3">
                  {professional.gallery.map((image, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      <img
                        src={image}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-[#F4C0D1] p-6">
              <h2 className="text-lg font-semibold text-[#2C1A23] mb-4">Reviews</h2>
              <div className="space-y-4">
                {professional.reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-[#F4C0D1] last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-[#2C1A23]">{review.author}</p>
                        <p className="text-xs text-[#bba0ab]">{review.date}</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < review.rating ? 'fill-[#D4537E] text-[#D4537E]' : 'text-[#F4C0D1]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#7a5a67]">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center bg-[#FBEAF0] rounded-3xl p-8 border border-[#F4C0D1]">
          <h3 className="text-xl font-semibold text-[#2C1A23] mb-3">Ready to Book?</h3>
          <p className="text-[#7a5a67] mb-6">Create a free account to message professionals and book appointments.</p>
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
