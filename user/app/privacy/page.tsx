import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Link Communications Center',
  description: 'How Link Communications Center collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Last updated: {new Date().getFullYear()}</p>

        <div className="space-y-6 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p>
            Link Communications Center (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what
            information we collect when you use our website and how we use it.
          </p>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Information we collect</h2>
            <p>
              We collect the details you provide when creating an account or placing an order, such as your name,
              email address, phone number, and delivery information. When you pay, your mobile money or card
              transaction is processed securely by our payment partner (Pesapal); we do not store your full payment
              credentials.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>How we use your information</h2>
            <p>
              We use your information to process orders, deliver products, provide customer support, and keep you
              informed about your purchases. We may also use it to improve our services and, where you have agreed,
              to send you offers and updates.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Sharing</h2>
            <p>
              We share information only with the service providers needed to run our business, such as payment
              processors and delivery partners, and where required by law. We never sell your personal data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal information at any time by
              contacting us at info@lcc.co.ug.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Contact</h2>
            <p>
              Questions about this policy? Email info@lcc.co.ug or call +256 700 123456.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
