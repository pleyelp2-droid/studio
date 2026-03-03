
'use client';

import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { SimulationManager } from '@/components/game/SimulationManager';
import { useEffect } from 'react';
import { useStore } from '@/store';
import { AIService } from '@/services/AIService';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const addLog = useStore(state => state.addLog);

  // Global Error Listener for "Matrix Corruption"
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Matrix Corruption Detected:", event.error);
      addLog(`Corruption: ${event.message}`, 'ERROR');
      // Trigger deep diagnostics if possible
      AIService.diagnose('RUNTIME_ERROR', event.error?.stack);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [addLog]);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          <SidebarProvider>
            <SimulationManager />
            {children}
          </SidebarProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
