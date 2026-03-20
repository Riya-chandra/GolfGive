import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GolfGive — Play. Win. Give.',
  description: 'A subscription golf platform combining performance tracking, monthly prize draws, and meaningful charity giving.',
  keywords: 'golf, charity, subscription, stableford, prize draw',
  openGraph: {
    title: 'GolfGive — Play. Win. Give.',
    description: 'Track your scores, win monthly prizes, and support causes you care about.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
