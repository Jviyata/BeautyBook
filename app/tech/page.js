import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TechDashboardNav from '@/components/TechDashboardNav'

const sections = [
  {
    title: 'Messages',
    description: 'Check client requests and respond quickly.',
    href: '/tech/messages',
  },
  {
    title: 'Edit Hours',
    description: 'Update operating hours users can view.',
    href: '/tech/hours',
  },
  {
    title: 'Edit Profile',
    description: 'Manage profile photo, location, and bio.',
    href: '/tech/profile',
  },
  {
    title: 'Calendar Planning',
    description: 'Plan client appointments from requests.',
    href: '/tech/calendar',
  },
]

export default function TechPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="profile" />
      <main className="page-shell space-y-4">
        <TechDashboardNav />

        <section className="rounded-3xl border border-[#e8e8e8] bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a8a8a]">Tech Dashboard</p>
          <h1 className="mt-2 font-display text-3xl text-[#1f1f1f]">Manage Your Business</h1>
          <p className="mt-2 text-sm text-[#666]">Your tools are now split across separate pages.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.href} className="rounded-3xl border border-[#e8e8e8] bg-white p-5">
              <h2 className="text-lg font-semibold text-[#1f1f1f]">{section.title}</h2>
              <p className="mt-1 text-sm text-[#666]">{section.description}</p>
              <Link href={section.href} className="mt-4 inline-flex rounded-xl bg-[#1f1f1f] px-3 py-2 text-xs font-medium text-white">
                Open page
              </Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
