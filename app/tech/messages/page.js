'use client'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import TechDashboardNav from '@/components/TechDashboardNav'

export default function TechMessagesPage() {
  const [loading, setLoading] = useState(true)
  const [professionalLinked, setProfessionalLinked] = useState(true)
  const [professional, setProfessional] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [replyDraft, setReplyDraft] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const nextConversations = Array.isArray(data?.conversations) ? data.conversations : []
        setConversations(nextConversations)
        setSelectedConversationId(nextConversations[0]?.id || '')
        setProfessionalLinked(data?.professionalLinked !== false)
        setProfessional(data?.professional || null)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load conversations.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || conversations[0] || null,
    [conversations, selectedConversationId],
  )

  async function sendReply() {
    if (!selectedConversation || !replyDraft.trim()) return

    setError('')
    setSendingReply(true)

    try {
      const res = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyDraft.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Could not send reply.')
        setSendingReply(false)
        return
      }

      const updatedConversation = data.conversation
      setConversations((current) => [
        updatedConversation,
        ...current.filter((conversation) => conversation.id !== updatedConversation.id),
      ])
      setSelectedConversationId(updatedConversation.id)
      setReplyDraft('')
    } catch {
      setError('Could not send reply.')
    } finally {
      setSendingReply(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="profile" />
      <main className="page-shell space-y-4">
        <TechDashboardNav />
        <section className="rounded-3xl border border-[#e8e8e8] bg-white p-5">
          <h1 className="text-xl font-semibold text-[#1f1f1f]">Messages</h1>
          <p className="text-sm text-[#666]">Chat with clients without sending them outside Beauty Book.</p>

          {loading ? (
            <p className="mt-4 text-sm text-[#777]">Loading conversations...</p>
          ) : !professionalLinked ? (
            <div className="mt-4 rounded-2xl border border-[#f0d9e3] bg-[#fff8fb] p-4">
              <p className="text-sm text-[#7a5a67]">This tech account is not linked to a public professional profile yet.</p>
              <p className="mt-1 text-xs text-[#bba0ab]">Use the same email on your tech account and your public professional listing to open the shared inbox.</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-[#ececec] bg-[#fafafa] p-4">
              <p className="text-sm text-[#1f1f1f]">No client conversations yet.</p>
              <p className="mt-1 text-xs text-[#666]">{professional?.name ? `${professional.name}'s` : 'Your'} inbox will appear here once a user sends a message from the app.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 lg:grid-cols-[280px_1fr]">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'border-[#f3d7e3] bg-[#fff8fb]'
                        : 'border-[#ececec] bg-[#fafafa]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1f1f1f] truncate">{conversation.user?.name}</p>
                      <span className="text-[10px] text-[#bba0ab] shrink-0">{new Date(conversation.lastMessageAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#7a5a67] truncate">{conversation.user?.email}</p>
                    <p className="mt-2 text-xs text-[#666] truncate">{conversation.lastMessage?.body || 'No messages yet'}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-[#ececec] bg-[#fcfcfc] p-4">
                <div className="border-b border-[#f0f0f0] pb-3">
                  <p className="text-sm font-semibold text-[#1f1f1f]">{selectedConversation.user?.name}</p>
                  <p className="text-xs text-[#7a5a67]">{selectedConversation.user?.email}</p>
                </div>

                <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        message.mine
                          ? 'ml-auto bg-[var(--pink)] text-white'
                          : 'bg-white border border-[#ececec] text-[#444]'
                      }`}
                    >
                      <p>{message.body}</p>
                      <p className={`mt-1 text-[10px] ${message.mine ? 'text-white/80' : 'text-[#999]'}`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-2">
                  <textarea
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder={`Reply to ${selectedConversation.user?.name}...`}
                    className="min-h-[110px] w-full rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-sm outline-none focus:border-[#D4537E]"
                  />
                  <button
                    type="button"
                    onClick={sendReply}
                    disabled={sendingReply}
                    className="rounded-xl bg-[#D4537E] px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
                  >
                    {sendingReply ? 'Sending...' : 'Send reply'}
                  </button>
                  {error ? <p className="text-xs text-[#b42318]">{error}</p> : null}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
