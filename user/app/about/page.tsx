import Navbar from '../../components/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-black mb-4">About</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Link Communications Center provides security and communications solutions tailored for homes and businesses.
        </p>
      </div>
    </div>
  )
}

