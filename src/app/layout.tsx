import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './providers';
import SharedNavBar from '@/components/SharedNavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OpenAtlas',
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
      <body>
        <ClientProviders>
          <SharedNavBar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
} 