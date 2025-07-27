import React from 'react';
import { Toaster } from '@/shared/components/atoms/ui/sonner';

import { Provider } from '@/shared/providers';
import NextTopLoader from 'nextjs-toploader';
import { Livvic } from 'next/font/google';
import { TrialBanner } from '@/shared/components/trial-banner';
import '@/shared/styles/globals.css';

const spaceGrotesk = Livvic({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
});

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable}  font-space-grotesk`}>
        <NextTopLoader showSpinner={true} />
        <Provider>
          <TrialBanner />
          {children}
        </Provider>
        <Toaster richColors />
      </body>
    </html>
  );
}
