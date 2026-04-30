'use client'
import { useState, useRef } from 'react'
import { Star, Plus, X } from 'lucide-react'

export default function ReviewForm({ professionalId, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState([])
  const [shareToFeed, setShareToFeed] = useState(false)
  const fileInputRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        professionalId, 
        rating, 
        comment,
        photos: photos.map(p => p.url),
        shareToFeed
      }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to submit review')
    } else {
      onSuccess(data)
      // Reset form
      setRating(0)
      setComment('')
      setPhotos([])
      setShareToFeed(false)
    }
  }

  function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotos(prev => [...prev, { url: event.target?.result, name: file.name }])
      }
      reader.readAsDataURL(file)
    })
  }

  function removePhoto(index) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
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

        {/* Photo upload section */}
        <div className="border border-dashed border-[#F4C0D1] rounded-xl p-3 bg-white">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-[#D4537E] hover:bg-[#FBEAF0] rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Photos
          </button>

          {/* Photo preview */}
          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={photo.url}
                    alt={`preview-${idx}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-2 -right-2 bg-[#D4537E] text-white rounded-full p-1 hover:bg-[#993556] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share to Feed option */}
        <div className="flex items-center gap-2 bg-white border border-[#F4C0D1] rounded-xl p-3">
          <input
            type="checkbox"
            id="shareToFeed"
            checked={shareToFeed}
            onChange={e => setShareToFeed(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-[#D4537E]"
          />
          <label htmlFor="shareToFeed" className="text-sm text-[#2C1A23] cursor-pointer font-medium">
            Share to feed
          </label>
        </div>

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
