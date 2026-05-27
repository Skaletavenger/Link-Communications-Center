import Navbar from '../../components/Navbar'

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-black mb-4">Contact</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Reach out for quotations, installations, and support.
        </p>
      </div>
    </div>
  )
}

