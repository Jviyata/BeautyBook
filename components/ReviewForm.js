'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'

export default function ReviewForm({ professionalId, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId, rating, comment }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to submit review')
    } else {
      onSuccess(data)
    }
  }

  return (
    <div className="bg-[#FBEAF0] rounded-2xl p-4 mb-4 border border-[#F4C0D1]">
      <h3 className="font-medium text-sm text-[#2C1A23] mb-3">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Star rating */}
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
            >
              <Star
                size={24}
                className={
                  i <= (hovered || rating)
                    ? 'fill-[#D4537E] text-[#D4537E]'
                    : 'text-[#F4C0D1]'
                }
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={3}
          className="w-full px-3 py-2.5 bg-white border border-[#F4C0D1] rounded-xl text-sm outline-none focus:border-[#D4537E] resize-none transition-colors"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D4537E] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#993556] disabled:opacity-60 transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
