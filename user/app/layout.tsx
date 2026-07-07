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

export const metadata: Metadata = {
  title: 'Link Communications Center',
  description: 'Security and communications solutions'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(openSans.variable, "font-sans")}>
      <body className={`${openSans.variable} font-sans antialiased`}>
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
