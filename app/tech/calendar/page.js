'use client'
import { useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import TechDashboardNav from '@/components/TechDashboardNav'
import { DEFAULT_MESSAGES } from '../dashboardData'

export default function TechCalendarPage() {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES)
  const [selectedDate, setSelectedDate] = useState('2026-05-03')
  const [calendarEvents, setCalendarEvents] = useState(
    DEFAULT_MESSAGES.filter((m) => m.status === 'planned').map((m) => ({
      messageId: m.id,
      client: m.client,
      service: m.service,
      date: m.requestedDate,
      time: m.requestedTime,
    })),
  )

  const todaysRequests = useMemo(
    () => messages.filter((msg) => msg.requestedDate === selectedDate),
    [messages, selectedDate],
  )

  const upcomingEvents = useMemo(
    () => [...calendarEvents].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    [calendarEvents],
  )

  function planRequest(message) {
    setMessages((current) =>
      current.map((msg) => (msg.id === message.id ? { ...msg, status: 'planned' } : msg)),
    )

    setCalendarEvents((current) => {
      if (current.some((event) => event.messageId === message.id)) return current
      return [
        ...current,
        {
          messageId: message.id,
          client: message.client,
          service: message.service,
          date: message.requestedDate,
          time: message.requestedTime,
        },
      ]
    })
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="profile" />
      <main className="page-shell space-y-4">
        <TechDashboardNav />
        <section className="rounded-3xl border border-[#e8e8e8] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-[#1f1f1f]">Calendar Planning</h1>
              <p className="text-sm text-[#666]">Plan clients based on message requests.</p>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-[#ddd] bg-white px-3 py-2 text-sm text-[#444]"
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#ececec] bg-[#fafafa] p-3">
              <h2 className="text-sm font-semibold text-[#1f1f1f]">Requests on {selectedDate}</h2>
              <div className="mt-2 space-y-2">
                {todaysRequests.length === 0 ? (
                  <p className="text-xs text-[#777]">No requests for this date.</p>
                ) : (
                  todaysRequests.map((req) => (
                    <div key={req.id} className="rounded-xl border border-[#e8e8e8] bg-white px-3 py-2 text-xs text-[#444]">
                      <p className="font-semibold text-[#1f1f1f]">{req.requestedTime} • {req.client}</p>
                      <p>{req.service}</p>
                      <button
                        type="button"
                        onClick={() => planRequest(req)}
                        className="mt-2 rounded-lg border border-[#dcdcdc] bg-white px-2.5 py-1 text-[11px] font-medium text-[#444]"
                      >
                        Add to planned
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#ececec] bg-[#fafafa] p-3">
              <h2 className="text-sm font-semibold text-[#1f1f1f]">Upcoming planned clients</h2>
              <div className="mt-2 space-y-2">
                {upcomingEvents.length === 0 ? (
                  <p className="text-xs text-[#777]">No planned clients yet.</p>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event.messageId} className="rounded-xl border border-[#e8e8e8] bg-white px-3 py-2 text-xs text-[#444]">
                      <p className="font-semibold text-[#1f1f1f]">{event.date} at {event.time}</p>
                      <p>{event.client} • {event.service}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
