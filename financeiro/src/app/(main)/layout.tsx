import { SWRProvider } from '@/app/components/providers/SWRProvider';
import { Sidebar } from '@/app/components/layout/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRProvider>
      <div className="flex min-h-screen bg-[#0d1117]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SWRProvider>
  );
}
