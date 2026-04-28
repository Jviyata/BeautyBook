'use client'
import Link from 'next/link'
import { Sparkles, Search, User, Heart, MessageCircle } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#fdf6f9]">
      {/* Header */}
      <div className="bg-white border-b border-[#F4C0D1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FBEAF0] rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-[#D4537E]" />
            </div>
            <h1 className="text-xl font-semibold text-[#2C1A23]">Beauty Book Demo</h1>
          </div>
          <Link href="/login" className="text-xs text-[#D4537E] font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#2C1A23] mb-3">Explore Beauty Book</h2>
          <p className="text-[#7a5a67] max-w-2xl mx-auto">
            Browse professionals, view services, and discover local beauty experts without creating an account.
          </p>
        </div>

        {/* Demo Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Search Professionals */}
          <Link
            href="/demo/search"
            className="group bg-white rounded-3xl border border-[#F4C0D1] p-8 hover:border-[#D4537E] transition-colors hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-[#FBEAF0] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#D4537E] transition-colors">
              <Search className="text-[#D4537E] group-hover:text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#2C1A23] mb-2">Search Professionals</h3>
            <p className="text-sm text-[#7a5a67] mb-4">
              Find nail artists, hair stylists, lash experts, and more in your area. Filter by service, price, and rating.
            </p>
            <span className="text-xs font-medium text-[#D4537E] group-hover:underline">Explore →</span>
          </Link>

          {/* View Professional Profiles */}
          <Link
            href="/demo/professionals"
            className="group bg-white rounded-3xl border border-[#F4C0D1] p-8 hover:border-[#D4537E] transition-colors hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-[#FBEAF0] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#D4537E] transition-colors">
              <User className="text-[#D4537E] group-hover:text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#2C1A23] mb-2">View Profiles</h3>
            <p className="text-sm text-[#7a5a67] mb-4">
              Check out professional portfolios, reviews, gallery images, and working hours to find the perfect match.
            </p>
            <span className="text-xs font-medium text-[#D4537E] group-hover:underline">Explore →</span>
          </Link>

          {/* Read Reviews */}
          <div className="group bg-white rounded-3xl border border-[#F4C0D1] p-8">
            <div className="w-12 h-12 bg-[#FBEAF0] rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="text-[#D4537E]" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#2C1A23] mb-2">Read Reviews</h3>
            <p className="text-sm text-[#7a5a67] mb-4">
              See real customer reviews and ratings to make informed decisions about which professional to choose.
            </p>
            <span className="text-xs font-medium text-[#bba0ab]">View in search results</span>
          </div>

          {/* Create Account */}
          <Link
            href="/register"
            className="group bg-white rounded-3xl border border-[#F4C0D1] p-8 hover:border-[#D4537E] transition-colors hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-[#FBEAF0] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#D4537E] transition-colors">
              <Heart className="text-[#D4537E] group-hover:text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#2C1A23] mb-2">Save Favorites</h3>
            <p className="text-sm text-[#7a5a67] mb-4">
              Create an account to save your favorite professionals, leave reviews, and book appointments.
            </p>
            <span className="text-xs font-medium text-[#D4537E] group-hover:underline">Sign Up →</span>
          </Link>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-[#FBEAF0] rounded-3xl p-8 border border-[#F4C0D1]">
          <h3 className="text-xl font-semibold text-[#2C1A23] mb-3">Ready to Get Started?</h3>
          <p className="text-[#7a5a67] mb-6">Create a free account to save favorites, leave reviews, and book appointments.</p>
          <Link
            href="/register"
            className="inline-block bg-[#D4537E] text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Create Account
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-xs text-[#bba0ab]">
          <p>No account required to browse. Create one to unlock full features.</p>
        </div>
      </div>
    </div>
  )
}
