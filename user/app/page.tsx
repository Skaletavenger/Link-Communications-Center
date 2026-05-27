import Link from 'next/link'
import Navbar from '../components/Navbar'
import ParticleCanvas from '../components/ParticleCanvas'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(21,116,181,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(244,120,33,0.10),transparent_38%)]" />
        <ParticleCanvas />

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.35em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Link Communications Center
            </p>
            <h1 className="text-5xl md:text-6xl font-black leading-[1.05] mb-6">
              Security & communications solutions, built for reliability.
            </h1>
            <p className="text-lg md:text-xl mb-10" style={{ color: 'var(--text-secondary)' }}>
              Explore our inventory of surveillance cameras, access control, networking, intercoms, alarms, and phones.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="px-6 py-4 rounded-2xl font-extrabold text-center"
                style={{ background: '#1574B5', color: 'white' }}
              >
                Browse Products
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-4 rounded-2xl font-extrabold text-center border"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
