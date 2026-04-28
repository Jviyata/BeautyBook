'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import TechDashboardNav from '@/components/TechDashboardNav'
import { DEFAULT_HOURS, DEFAULT_PROFILE } from '../dashboardData'

export default function TechProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [hours] = useState(DEFAULT_HOURS)
  const [saved, setSaved] = useState('')

  function saveProfile(e) {
    e.preventDefault()
    setSaved('Profile updated for what users see.')
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="profile" />
      <main className="page-shell space-y-4">
        <TechDashboardNav />
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#e8e8e8] bg-white p-5">
            <h1 className="text-xl font-semibold text-[#1f1f1f]">Edit Public Profile</h1>
            <p className="text-sm text-[#666]">Update the profile users can view.</p>

            <form onSubmit={saveProfile} className="mt-4 space-y-2.5">
              <input
                value={profile.name}
                onChange={(e) => setProfile((current) => ({ ...current, name: e.target.value }))}
                placeholder="Name"
                className="w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-[#D4537E]"
              />
              <input
                value={profile.specialty}
                onChange={(e) => setProfile((current) => ({ ...current, specialty: e.target.value }))}
                placeholder="Specialty"
                className="w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-[#D4537E]"
              />
              <input
                value={profile.location}
                onChange={(e) => setProfile((current) => ({ ...current, location: e.target.value }))}
                placeholder="Location"
                className="w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-[#D4537E]"
              />
              <input
                value={profile.photo}
                onChange={(e) => setProfile((current) => ({ ...current, photo: e.target.value }))}
                placeholder="Profile photo URL"
                className="w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-[#D4537E]"
              />
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((current) => ({ ...current, bio: e.target.value }))}
                placeholder="Bio"
                className="min-h-[90px] w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-[#D4537E]"
              />
              <button type="submit" className="w-full rounded-xl bg-[#D4537E] py-2.5 text-sm font-medium text-white">
                Save profile
              </button>
              {saved ? <p className="text-xs text-green-700">{saved}</p> : null}
            </form>
          </section>

          <section className="rounded-3xl border border-[#e8e8e8] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#1f1f1f]">What users see</h2>
            <div className="mt-3 rounded-2xl border border-[#ececec] bg-[#fafafa] p-3">
              <img src={profile.photo} alt={profile.name} className="h-36 w-full rounded-xl object-cover" />
              <h3 className="mt-3 text-sm font-semibold text-[#1f1f1f]">{profile.name}</h3>
              <p className="text-xs text-[#666]">{profile.specialty}</p>
              <p className="mt-1 text-xs text-[#666]">📍 {profile.location}</p>
              <p className="mt-2 text-xs text-[#444]">{profile.bio}</p>
              <div className="mt-3 border-t border-[#e7e7e7] pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Hours</p>
                <div className="mt-1 space-y-1">
                  {Object.entries(hours).map(([day, value]) => (
                    <div key={day} className="flex items-center justify-between text-[11px] text-[#555]">
                      <span>{day}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
