'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  'Find nail techs near me under $60',
  'Who does the best lashes in Lafayette?',
  'I want a natural hair color, budget $100',
]

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm BeautyBot 💅 Tell me what you're looking for — service, style, budget, and location — and I'll find the perfect match for you!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || 'Sorry, something went wrong.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I ran into an error. Please try again!' }])
    } finally {
      setLoading(false)
    }
  }

  // Simple markdown bold renderer
  function renderText(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="font-semibold text-[#2C1A23]">{part.slice(2, -2)}</strong>
        : part
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-[#F4C0D1] bg-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#FBEAF0] flex items-center justify-center">
            <Sparkles size={17} className="text-[#D4537E]" />
          </div>
          <div>
            <div className="font-display font-semibold text-[#2C1A23] text-sm">BeautyBot</div>
            <div className="text-[10px] text-[#D4537E]">AI Beauty Assistant</div>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#fdf6f9] flex items-center justify-center">
          <X size={16} className="text-[#7a5a67]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#FBEAF0] flex items-center justify-center mr-2 shrink-0 mt-1">
                <Sparkles size={12} className="text-[#D4537E]" />
              </div>
            )}
            <div
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#D4537E] text-white rounded-br-sm'
                  : 'bg-[#fdf6f9] text-[#2C1A23] border border-[#F4C0D1] rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? renderText(msg.text) : msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-[#FBEAF0] flex items-center justify-center mr-2 shrink-0">
              <Sparkles size={12} className="text-[#D4537E]" />
            </div>
            <div className="bg-[#fdf6f9] border border-[#F4C0D1] px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-[#D4537E] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-[#7a5a67] mb-2">Try asking:</p>
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left text-xs bg-[#FBEAF0] text-[#D4537E] px-4 py-2.5 rounded-xl hover:bg-[#F4C0D1] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 pb-8 border-t border-[#F4C0D1] bg-white">
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Describe what you're looking for..."
            className="flex-1 px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm outline-none focus:border-[#D4537E] transition-colors"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-[#D4537E] text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-[#993556] transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
