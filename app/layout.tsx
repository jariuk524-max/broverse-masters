import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Титановый Монолит — BroVerse',
  description: 'Командный центр мастера BroVerse',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="overflow-y-auto bg-black text-white antialiased">{children}</body>
    </html>
  );
}
