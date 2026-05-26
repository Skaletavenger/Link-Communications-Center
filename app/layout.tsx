import './globals.css';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Open_Sans } from 'next/font/google';
import { ThemeProvider } from '../lib/ThemeContext';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap'
});

const SiteWrapper = dynamic(() => import('../components/SiteWrapper'), { ssr: false });

export const metadata = {
  title: 'Link Communications Center',
  description: 'Security and communications solutions'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className={`${openSans.variable} font-sans antialiased`}>
        <ThemeProvider>
          <SiteWrapper>{children}</SiteWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
