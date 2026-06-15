import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/ThemeContext'
import { cn } from "@/lib/utils";

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
    <html lang="en" className={cn("dark", openSans.variable, "font-sans")}>
      <body className={`${openSans.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
