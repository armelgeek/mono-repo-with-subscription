import React from 'react';

import '@/shared/styles/globals.css';
interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default async function BaseLayout({ children }: RootLayoutProps) {
  return (
      <main>
        {children}
      </main>
  );
}
