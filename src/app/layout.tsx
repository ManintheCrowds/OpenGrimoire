import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './providers';
import SharedNavBar from '@/components/SharedNavBar';
import SiteFooter from '@/components/SiteFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OpenGrimoire',
  description:
    'Operator context atlas: visualize co-access across session journals and handoffs. Includes D3 demos and a legacy multi-step intake form.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex min-h-screen flex-col">
        <ClientProviders>
          <SharedNavBar />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ClientProviders>
      </body>
    </html>
  );
} 