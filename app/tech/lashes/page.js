import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { LASH_TECHS } from '../techData'

export default function LashTechsPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="search" />
      <main className="page-shell space-y-4">
        <section className="rounded-3xl border border-[#e8e8e8] bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a8a8a]">Bay Area</p>
          <h1 className="mt-2 font-display text-3xl text-[#1f1f1f]">Lash Techs</h1>
          <p className="mt-2 text-sm text-[#666]">{LASH_TECHS.length} generated profiles</p>
        </section>

        <section className="rounded-3xl border border-[#e8e8e8] bg-white p-5">
          <ol className="grid gap-2 sm:grid-cols-2">
            {LASH_TECHS.map((tech, index) => (
              <li key={tech.name} className="rounded-2xl border border-[#eee] bg-[#fafafa] px-4 py-3 text-sm text-[#333]">
                <span className="font-semibold text-[#1f1f1f]">{index + 1}. {tech.name}</span>
                <span className="text-[#777]"> — {tech.city}</span>
              </li>
            ))}
          </ol>
        </section>

        <div>
          <Link href="/tech" className="inline-flex rounded-xl border border-[#ddd] bg-white px-4 py-2 text-sm font-medium text-[#444]">
            Back to tech pages
          </Link>
        </div>
      </main>
    </div>
  )
}
