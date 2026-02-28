'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowUpDown,
  Wallet,
  MessageSquare,
  LifeBuoy,
  CreditCard,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/app/lib/utils/cn';
import { useItems } from '@/app/hooks/useItems';
import { useIdentity } from '@/app/hooks/useIdentity';
import { getInitials } from '@/app/lib/utils/format';
import { ConnectButton } from '@/app/components/shared/ConnectButton';
import { useSWRConfig } from 'swr';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Visão Geral',
    href: '/',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Transações',
    href: '/transactions',
    icon: <ArrowUpDown size={18} />,
  },
  {
    label: 'Contas',
    href: '/accounts',
    icon: <Wallet size={18} />,
  },
];

const bottomItems: NavItem[] = [
  {
    label: 'Feedback e Bugs',
    href: '#',
    icon: <MessageSquare size={18} />,
  },
  {
    label: 'Suporte',
    href: '#',
    icon: <LifeBuoy size={18} />,
  },
  {
    label: 'Plano',
    href: '#',
    icon: <CreditCard size={18} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { items, mutate: mutateItems } = useItems();
  const firstItemId = items[0]?.item_id;
  const { identity } = useIdentity(firstItemId);
  const { mutate } = useSWRConfig();

  const handleConnectSuccess = () => {
    // Revalidate all items data
    mutate(() => true, undefined, { revalidate: true });
  };

  const displayName =
    identity?.full_name ||
    identity?.company_name ||
    'Usuário';

  const email = identity?.emails?.[0]?.value || '';
  const initials = getInitials(displayName);

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[#161b22] border-r border-[#30363d] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-[#30363d]">
        <div className="w-7 h-7 rounded-md bg-[#58a6ff] flex items-center justify-center">
          <span className="text-black text-xs font-bold">F</span>
        </div>
        <span className="text-[#e6edf3] font-semibold text-base tracking-tight">
          Financeiro
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Section: Organização */}
        <p className="text-[#8b949e] text-xs font-medium uppercase tracking-wider px-2 mb-2">
          Organização
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#21262d] text-[#58a6ff] font-medium'
                  : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="my-4 border-t border-[#30363d]" />

        {/* Connect Button */}
        <div className="px-2 pb-2">
          <ConnectButton
            onSuccess={handleConnectSuccess}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#58a6ff] px-3 py-2 text-sm font-semibold text-black transition-all hover:bg-[#79b8ff]"
          />
        </div>

        {/* Institutions count */}
        {items.length > 0 && (
          <div className="px-2">
            <p className="text-[#8b949e] text-xs px-1 mb-1">Instituições</p>
            {items.map((item) => (
              <div
                key={item.item_id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#8b949e]"
              >
                {item.connector_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.connector_image_url}
                    alt={item.connector_name || 'Bank'}
                    className="w-5 h-5 rounded object-contain"
                  />
                ) : (
                  <div
                    className="w-5 h-5 rounded text-xs flex items-center justify-center text-white font-bold"
                    style={{ background: item.primary_color || '#8b949e' }}
                  >
                    {(item.connector_name || 'B')[0]}
                  </div>
                )}
                <span className="truncate text-xs">{item.connector_name || item.institution_name}</span>
                <span
                  className={cn(
                    'ml-auto w-2 h-2 rounded-full shrink-0',
                    item.status === 'UPDATED' ? 'bg-[#3fb950]' : 'bg-[#d29922]'
                  )}
                />
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom items */}
      <div className="px-3 pb-2 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>

      {/* User profile */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-[#30363d]">
        <div className="w-8 h-8 rounded-full bg-[#58a6ff] flex items-center justify-center text-black text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#e6edf3] text-sm font-medium truncate">{displayName}</p>
          <p className="text-[#8b949e] text-xs truncate">{email}</p>
        </div>
        <ChevronUp size={14} className="text-[#8b949e] shrink-0" />
      </div>
    </aside>
  );
}
