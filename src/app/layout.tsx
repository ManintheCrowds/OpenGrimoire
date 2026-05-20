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
    'Operator brain map: visualize co-access across session journals and handoffs. Sync Session alignment intake and cohort visualizations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} dark`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ClientProviders>
          <SharedNavBar />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <SiteFooter />
        </ClientProviders>
      </body>
    </html>
  );
} 