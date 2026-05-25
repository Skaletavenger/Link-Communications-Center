import './globals.css';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '../lib/ThemeContext';

const SiteWrapper = dynamic(() => import('../components/SiteWrapper'), { ssr: false });

export const metadata = {
  title: 'Link Communications Center',
  description: 'Security and communications solutions'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <SiteWrapper>{children}</SiteWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
