import type { Metadata, Viewport } from 'next';
import { Archivo, Space_Grotesk } from 'next/font/google';
import './globals.css';
import AppleNav from '@/components/AppleNav';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DeadDrop',
  description: 'Encrypted dead-drops. Anonymous. Ephemeral. Untraceable.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${spaceGrotesk.variable} antialiased bg-[#020617] text-[#F8FAFC] min-h-[100dvh]`}
      >
        <AppleNav />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}

