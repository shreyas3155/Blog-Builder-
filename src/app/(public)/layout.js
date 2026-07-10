import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-16 bg-background/80 border-b border-border/50" />}>
        <Navbar />
      </Suspense>
      <main className="flex-grow flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
