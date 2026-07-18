import './globals.css';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Open_Sans } from 'next/font/google';
import { ThemeProvider } from '../lib/ThemeContext';
import { SpeedInsights } from '@vercel/speed-insights/next';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap'
});

const SiteWrapper = dynamic(() => import('../components/SiteWrapper'), { ssr: false });

export const metadata = {
  title: 'Link Communications Center',
  description: 'Security and communications solutions',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={openSans.variable}>
      <body className={`${openSans.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('lcc-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <SiteWrapper>{children}</SiteWrapper>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
