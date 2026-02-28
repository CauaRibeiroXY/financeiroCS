'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowUpDown,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/app/lib/utils/cn';
import { useItems } from '@/app/hooks/useItems';
import { useAccounts } from '@/app/hooks/useAccounts';
import { useIdentity } from '@/app/hooks/useIdentity';
import { getInitials } from '@/app/lib/utils/format';
import React from 'react';
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

// bottom items removed per design – sidebar will no longer show feedback/support/plan links
const bottomItems: NavItem[] = [];

export function Sidebar() {
  const pathname = usePathname();
  const { items, mutate: mutateItems } = useItems();
  const firstItemId = items[0]?.item_id;
  const { identity } = useIdentity(firstItemId);
  const { accounts } = useAccounts(firstItemId);
  const { mutate } = useSWRConfig();
  const [collapsed, setCollapsed] = React.useState(false);

  const displayName =
    identity?.full_name ||
    identity?.company_name ||
    'Usuário';

  const email = identity?.emails?.[0]?.value || '';
  const initials = getInitials(displayName);

  return (
    <aside className={cn(
        'flex flex-col min-h-screen bg-[#161b22] border-r border-[#30363d] shrink-0 overflow-hidden',
        collapsed ? 'w-16' : 'w-60'
      )}>
      {/* Header: logo and collapse toggle */}
      <div
        className={cn(
          'flex items-center border-b border-[#30363d]',
          collapsed ? 'justify-center px-1 py-5' : 'justify-between px-5 py-5'
        )}
      >
        {collapsed ? (
          <div className="flex items-center gap-0">
            <div className="w-7 h-7 rounded-md bg-[#58a6ff] flex items-center justify-center">
              <span className="text-black text-xs font-bold">F</span>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-[#21262d] ml-1"
            >
              <ChevronRight size={18} className="text-[#8b949e]" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#58a6ff] flex items-center justify-center">
                <span className="text-black text-xs font-bold">F</span>
              </div>
              <span className="text-[#e6edf3] font-semibold text-base tracking-tight">
                Financeiro
              </span>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-[#21262d]"
            >
              <ChevronLeft size={18} className="text-[#8b949e]" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Section: Organização */}
        {!collapsed && (
          <p className="text-[#8b949e] text-xs font-medium uppercase tracking-wider px-2 mb-2">
            Organização
          </p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                collapsed ? 'justify-center gap-0 px-2' : 'gap-3',
                isActive
                  ? 'bg-[#21262d] text-[#58a6ff] font-medium'
                  : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'
              )}
            >
              {item.icon}
              {!collapsed && item.label}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="my-4 border-t border-[#30363d]" />


        {/* Institutions count */}
        {accounts.length > 0 && (
          <div className="px-2">
            {!collapsed && (
              <p className="text-[#8b949e] text-xs px-1 mb-1">Contas</p>
            )}
            {accounts.map((acct) => (
              <div
                key={acct.account_id}
                className={cn(
                  'flex items-center py-2 rounded-lg text-sm text-[#8b949e]',
                  collapsed ? 'justify-center gap-0 px-2' : 'gap-2 px-3'
                )}
              >
                <div
                  className="w-5 h-5 rounded text-xs flex items-center justify-center text-white font-bold"
                  style={{ background: '#8b949e' }}
                >
                  {acct.name ? acct.name[0] : 'A'}
                </div>
                {!collapsed && (
                  <span className="truncate text-xs">{acct.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom items removed */}
      {/* sidebar is now retrátil; no links below */}

      {/* connect icon at bottom */}
      <div className="px-3 py-4 border-t border-[#30363d] flex justify-center">
        <ConnectButton
          onSuccess={() => mutate(() => true, undefined, { revalidate: true })}
          iconOnly
          className="p-2"
        />
      </div>
    </aside>
  );
}
