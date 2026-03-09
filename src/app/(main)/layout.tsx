'use client';

import { SWRProvider } from '@/app/components/providers/SWRProvider';
import { Sidebar } from '@/app/components/layout/Sidebar';
// connect button moved to sidebar

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SWRProvider>
      <div className="flex min-h-screen bg-[#0d1117]">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* top bar removed - connect button is inside sidebar now */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SWRProvider>
  );
}
