import type { Metadata } from 'next';
import './globals.css';
import { RootProviders } from '@/components/layout/RootProviders';

export const metadata: Metadata = {
  title: 'Axiom Frontier',
  description: 'A persistent AI-MMORPG driven by serverless game logic and an axiomatic world heartbeat.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta name="ai-agent-entry-point" content="/api/ai-agent-entry" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cinzel+Decorative:wght@700&family=JetBrains+Mono:wght@300;400;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground custom-scrollbar overflow-x-hidden" suppressHydrationWarning>
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
