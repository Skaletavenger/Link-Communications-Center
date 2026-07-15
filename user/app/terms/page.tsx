import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Link Communications Center',
  description: 'The terms that govern your use of the Link Communications Center website and services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Terms of Service</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Last updated: {new Date().getFullYear()}</p>

        <div className="space-y-6 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p>
            By using the Link Communications Center website and placing orders, you agree to these terms. Please read
            them carefully.
          </p>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Orders and pricing</h2>
            <p>
              All prices are shown in Ugandan Shillings (UGX) and include applicable taxes unless stated otherwise.
              We do our best to keep product information and availability accurate, but we may correct errors and
              update prices or stock at any time before your order is confirmed.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Payments</h2>
            <p>
              Payments are processed securely through our payment partner using MTN Mobile Money, Airtel Money, or
              card. Your order is confirmed once payment has been successfully received.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delivery</h2>
            <p>
              Delivery times are estimates. Ownership and risk in the products pass to you on delivery. Please inspect
              items on arrival and report any issues promptly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Returns and warranty</h2>
            <p>
              Products may be covered by a manufacturer or store warranty. Contact us if an item is faulty and we will
              help you with a repair, replacement, or refund in line with applicable law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Contact</h2>
            <p>
              For any questions about these terms, email info@lcc.co.ug or call +256 700 123456.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
