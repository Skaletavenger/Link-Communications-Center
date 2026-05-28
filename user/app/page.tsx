'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] dark:bg-[#0a0f1e]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col 
                          items-start justify-center 
                          px-6 md:px-16 pt-20">
        <h1 className="text-4xl md:text-6xl font-black 
                       text-white mb-4 leading-tight">
          Link <span style={{ color: '#1574B5' }}>
            Communications
          </span> Center
        </h1>
        
        <p className="text-white/60 text-lg mb-10 
                      max-w-xl leading-relaxed">
          Secure, monitor, and manage your environments 
          with enterprise surveillance and communications 
          solutions.
        </p>

        {/* Buttons - using Link not router */}
        <div className="flex flex-wrap gap-4">
          <Link href="/products">
            <span className="inline-block px-8 py-4 
                             rounded-xl font-bold text-white 
                             text-lg cursor-pointer
                             transition-all duration-200
                             hover:opacity-90 hover:scale-105
                             active:scale-95"
                  style={{ background: '#1574B5' }}>
              Browse Products
            </span>
          </Link>

          <Link href="/auth/login">
            <span className="inline-block px-8 py-4 
                             rounded-xl font-bold text-lg 
                             cursor-pointer border-2
                             transition-all duration-200
                             hover:opacity-90 hover:scale-105
                             active:scale-95"
                  style={{ 
                    borderColor: '#1574B5',
                    color: '#1574B5',
                    background: 'transparent'
                  }}>
              Sign In
            </span>
          </Link>
        </div>
      </section>
    </main>
  )
}
