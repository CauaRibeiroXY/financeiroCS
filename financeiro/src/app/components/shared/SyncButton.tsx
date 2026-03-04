'use client';

import { useState } from 'react';
import { RefreshCw, Loader2, Check, X } from 'lucide-react';
import { useSWRConfig } from 'swr';
import { cn } from '@/app/lib/utils/cn';

interface SyncButtonProps {
    className?: string;
    onSyncComplete?: () => void;
    iconOnly?: boolean;
}

export function SyncButton({ className, onSyncComplete, iconOnly = false }: SyncButtonProps) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { mutate } = useSWRConfig();

    const handleSync = async () => {
        if (isSyncing) return;

        setIsSyncing(true);
        setSyncStatus('idle');

        try {
            const res = await fetch('/api/cron/pluggy-sync');
            if (!res.ok) throw new Error('Sync failed');

            const data = await res.json();

            if (data.ok) {
                setSyncStatus('success');
                // Force re-fetch all active SWR hooks
                mutate(() => true, undefined, { revalidate: true });
                onSyncComplete?.();

                // Clear success icon after 3 seconds
                setTimeout(() => setSyncStatus('idle'), 3000);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (err) {
            console.error('Manual sync failed:', err);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus('idle'), 3000);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={isSyncing}
            title="Sincronizar todas as contas"
            className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all border border-[#30363d]',
                isSyncing
                    ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed'
                    : syncStatus === 'success'
                        ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/40'
                        : syncStatus === 'error'
                            ? 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/40'
                            : 'bg-[#161b22] text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]',
                className
            )}
        >
            {isSyncing ? (
                <Loader2 size={16} className="animate-spin" />
            ) : syncStatus === 'success' ? (
                <Check size={16} />
            ) : syncStatus === 'error' ? (
                <X size={16} />
            ) : (
                <RefreshCw size={16} />
            )}
            {!iconOnly && (
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}</span>
            )}
        </button>
    );
}
