import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/ThemeContext'
import { CartProvider } from '@/lib/CartContext'
import { cn } from "@/lib/utils";
import Navbar from '@/components/Navbar'
import Breadcrumb from '@/components/Breadcrumb'
import Footer from '@/components/Footer'
import { SpeedInsights } from '@vercel/speed-insights/next'

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap'
})

const SITE_URL = 'https://linkcommunicationscenter.com'
const SITE_DESCRIPTION =
  'Link Communications Center, Kampala — surveillance cameras (CCTV), access control, networking, intercoms, alarms and smartphones. Buy online, pay with MTN MoMo or Airtel Money, with delivery across Kampala. Smartphone loans available.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Link Communications Center | CCTV, Networking, Phones & Smartphone Loans in Kampala',
    template: '%s | Link Communications Center',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Link Communications Center',
  keywords: [
    'CCTV Kampala', 'security cameras Uganda', 'surveillance cameras Kampala', 'access control Uganda',
    'networking Kampala', 'intercoms', 'alarm systems Uganda', 'smartphones Kampala', 'phone shop Namirembe Road',
    'smartphone loans Uganda', 'MTN MoMo', 'Airtel Money', 'Link Communications Center',
  ],
  authors: [{ name: 'Link Communications Center' }],
  creator: 'Link Communications Center',
  publisher: 'Link Communications Center',
  category: 'Electronics & Security',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_UG',
    url: SITE_URL,
    siteName: 'Link Communications Center',
    title: 'Link Communications Center — CCTV, Networking, Phones & Loans in Kampala',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Link Communications Center — Kampala',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ElectronicsStore',
  '@id': SITE_URL,
  name: 'Link Communications Center',
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  telephone: '+256757837184',
  email: 'linkcomm72@gmail.com',
  priceRange: 'UGX',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Lions Shopping Center, Namirembe Road',
    addressLocality: 'Kampala',
    addressCountry: 'UG',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '16:00' },
  ],
  sameAs: [
    'https://www.facebook.com/Linkcomm2014/',
    'https://www.instagram.com/the_link_communications/',
    'https://www.tiktok.com/@linkcommunicationcentre',
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Link Communications Center',
  url: SITE_URL,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(openSans.variable, "font-sans")}>
      <body className={`${openSans.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('lcc-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            <Breadcrumb />
            <main>{children}</main>
            <Footer />
            <SpeedInsights />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
