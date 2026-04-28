'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import TechDashboardNav from '@/components/TechDashboardNav'
import { DEFAULT_MESSAGES } from '../dashboardData'

export default function TechMessagesPage() {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES)
  const [replyDrafts, setReplyDrafts] = useState({})

  function updateReply(id, value) {
    setReplyDrafts((current) => ({ ...current, [id]: value }))
  }

  function sendReply(id) {
    const text = replyDrafts[id]?.trim()
    if (!text) return
    setMessages((current) =>
      current.map((msg) => (msg.id === id ? { ...msg, status: 'replied' } : msg)),
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="profile" />
      <main className="page-shell space-y-4">
        <TechDashboardNav />
        <section className="rounded-3xl border border-[#e8e8e8] bg-white p-5">
          <h1 className="text-xl font-semibold text-[#1f1f1f]">Messages</h1>
          <p className="text-sm text-[#666]">Check client requests and reply directly.</p>

          <div className="mt-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="rounded-2xl border border-[#ececec] bg-[#fafafa] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1f1f1f]">{message.client}</p>
                    <p className="text-xs text-[#666]">{message.service} • {message.requestedDate} at {message.requestedTime}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    message.status === 'new' ? 'bg-[#fff3cd] text-[#8a6d3b]' : message.status === 'planned' ? 'bg-[#e7f3ff] text-[#245a8d]' : 'bg-[#e9f8ef] text-[#1f7a3e]'
                  }`}>
                    {message.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#444]">{message.note}</p>

                <textarea
                  value={replyDrafts[message.id] || ''}
                  onChange={(e) => updateReply(message.id, e.target.value)}
                  placeholder="Write a reply to confirm details..."
                  className="mt-3 min-h-[92px] w-full rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-sm outline-none focus:border-[#D4537E]"
                />

                <button
                  type="button"
                  onClick={() => sendReply(message.id)}
                  className="mt-3 rounded-xl bg-[#D4537E] px-3 py-2 text-xs font-medium text-white"
                >
                  Send reply
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
