'use client'
import { useState } from 'react'
import Link from 'next/link'

const initialEmails = [
  {
    id: 1,
    client: 'Olivia Chen',
    subject: 'Need to move my facial appointment',
    body: 'Can I move my booking from Thursday afternoon to Friday morning?',
    reply: '',
    replied: false,
  },
  {
    id: 2,
    client: 'Maya Johnson',
    subject: 'Question about lash refill timing',
    body: 'Is it okay to book a refill two weeks after my first appointment?',
    reply: '',
    replied: false,
  },
]

const initialHours = {
  Monday: '9:00 AM - 5:00 PM',
  Tuesday: '9:00 AM - 5:00 PM',
  Wednesday: '10:00 AM - 6:00 PM',
  Thursday: '9:00 AM - 5:00 PM',
  Friday: '9:00 AM - 4:00 PM',
  Saturday: '10:00 AM - 2:00 PM',
  Sunday: 'Closed',
}

export default function TechPage() {
  const [emails, setEmails] = useState(initialEmails)
  const [hours, setHours] = useState(initialHours)
  const [profile, setProfile] = useState({
    name: 'Ava Martinez',
    email: 'tech@beautybook.com',
    specialty: 'Skin Care Specialist',
    bio: 'Focused on client support, scheduling updates, and service coordination.',
  })
  const [hoursMessage, setHoursMessage] = useState('')
  const [profileMessage, setProfileMessage] = useState('')

  function updateReply(id, value) {
    setEmails((current) =>
      current.map((email) => (email.id === id ? { ...email, reply: value } : email))
    )
  }

  function sendReply(id) {
    setEmails((current) =>
      current.map((email) =>
        email.id === id && email.reply.trim()
          ? { ...email, replied: true }
          : email
      )
    )
  }

  function saveHours(e) {
    e.preventDefault()
    setHoursMessage('Hours updated.')
  }

  function saveProfile(e) {
    e.preventDefault()
    setProfileMessage('Profile saved.')
  }

  return (
    <div className="min-h-screen bg-[#fdf6f9] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#7a5a67]">Beauty Book</p>
            <h1 className="text-3xl font-semibold text-[#2C1A23]">Tech View</h1>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-[#D4537E] px-4 py-2 text-sm font-medium text-[#D4537E]"
          >
            Back to site
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl border border-[#F4C0D1] bg-white p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#2C1A23]">Client Emails</h2>
              <p className="text-sm text-[#7a5a67]">Reply directly from the tech dashboard.</p>
            </div>

            <div className="space-y-4">
              {emails.map((email) => (
                <div key={email.id} className="rounded-2xl border border-[#F4C0D1] bg-[#fdf6f9] p-4">
                  <div className="mb-2">
                    <p className="font-medium text-[#2C1A23]">{email.client}</p>
                    <p className="text-sm text-[#7a5a67]">{email.subject}</p>
                  </div>

                  <p className="mb-3 text-sm text-[#4b3440]">{email.body}</p>

                  <textarea
                    value={email.reply}
                    onChange={(e) => updateReply(email.id, e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[110px] w-full rounded-xl border border-[#F4C0D1] bg-white px-4 py-3 text-sm outline-none focus:border-[#D4537E]"
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs ${email.replied ? 'text-green-600' : 'text-[#7a5a67]'}`}>
                      {email.replied ? 'Reply sent.' : 'Draft pending.'}
                    </span>
                    <button
                      type="button"
                      onClick={() => sendReply(email.id)}
                      className="rounded-xl bg-[#D4537E] px-4 py-2 text-sm font-medium text-white"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-[#F4C0D1] bg-white p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-[#2C1A23]">Edit Hours</h2>
                <p className="text-sm text-[#7a5a67]">Update visible service hours.</p>
              </div>

              <form onSubmit={saveHours} className="space-y-3">
                {Object.entries(hours).map(([day, value]) => (
                  <label key={day} className="block">
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#7a5a67]">
                      {day}
                    </span>
                    <input
                      value={value}
                      onChange={(e) => setHours((current) => ({ ...current, [day]: e.target.value }))}
                      className="w-full rounded-xl border border-[#F4C0D1] bg-[#fdf6f9] px-4 py-3 text-sm outline-none focus:border-[#D4537E]"
                    />
                  </label>
                ))}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#D4537E] py-3 text-sm font-medium text-white"
                >
                  Save Hours
                </button>

                {hoursMessage ? <p className="text-xs text-green-600">{hoursMessage}</p> : null}
              </form>
            </section>

            <section className="rounded-3xl border border-[#F4C0D1] bg-white p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-[#2C1A23]">Profile</h2>
                <p className="text-sm text-[#7a5a67]">Create and maintain the tech profile.</p>
              </div>

              <form onSubmit={saveProfile} className="space-y-3">
                <input
                  value={profile.name}
                  onChange={(e) => setProfile((current) => ({ ...current, name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-[#F4C0D1] bg-[#fdf6f9] px-4 py-3 text-sm outline-none focus:border-[#D4537E]"
                />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((current) => ({ ...current, email: e.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-xl border border-[#F4C0D1] bg-[#fdf6f9] px-4 py-3 text-sm outline-none focus:border-[#D4537E]"
                />
                <input
                  value={profile.specialty}
                  onChange={(e) => setProfile((current) => ({ ...current, specialty: e.target.value }))}
                  placeholder="Specialty"
                  className="w-full rounded-xl border border-[#F4C0D1] bg-[#fdf6f9] px-4 py-3 text-sm outline-none focus:border-[#D4537E]"
                />
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((current) => ({ ...current, bio: e.target.value }))}
                  placeholder="Short bio"
                  className="min-h-[110px] w-full rounded-xl border border-[#F4C0D1] bg-[#fdf6f9] px-4 py-3 text-sm outline-none focus:border-[#D4537E]"
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#2C1A23] py-3 text-sm font-medium text-white"
                >
                  Save Profile
                </button>

                {profileMessage ? <p className="text-xs text-green-600">{profileMessage}</p> : null}
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
