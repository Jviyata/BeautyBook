'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import TechDashboardNav from '@/components/TechDashboardNav'
import { DEFAULT_HOURS } from '../dashboardData'

export default function TechHoursPage() {
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [saved, setSaved] = useState('')

  function saveHours(e) {
    e.preventDefault()
    setSaved('Hours updated for your public profile.')
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="profile" />
      <main className="page-shell space-y-4">
        <TechDashboardNav />
        <section className="rounded-3xl border border-[#e8e8e8] bg-white p-5">
          <h1 className="text-xl font-semibold text-[#1f1f1f]">Edit Service Hours</h1>
          <p className="text-sm text-[#666]">Set the hours users see on your profile.</p>

          <form onSubmit={saveHours} className="mt-4 space-y-2.5 max-w-xl">
            {Object.entries(hours).map(([day, value]) => (
              <label key={day} className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-[#777]">{day}</span>
                <input
                  value={value}
                  onChange={(e) => setHours((current) => ({ ...current, [day]: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-[#D4537E]"
                />
              </label>
            ))}
            <button type="submit" className="w-full rounded-xl bg-[#1f1f1f] py-2.5 text-sm font-medium text-white">
              Save hours
            </button>
            {saved ? <p className="text-xs text-green-700">{saved}</p> : null}
          </form>
        </section>
      </main>
    </div>
  )
}
