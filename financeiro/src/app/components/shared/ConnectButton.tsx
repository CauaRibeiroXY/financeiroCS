'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PlusCircle, Loader2 } from 'lucide-react';
import { api } from '@/app/lib/utils/api';
import { Item } from 'pluggy-sdk';

const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  {
    ssr: false,
    loading: () => null,
  }
);

interface ConnectButtonProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  className?: string;
  /** override default label text */
  label?: string;
  /** if true the button renders only the icon (hides text) */
  iconOnly?: boolean;
}

export function ConnectButton({
  onSuccess,
  onError,
  className,
  label,
  iconOnly = false,
}: ConnectButtonProps) {
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenConnect = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/api/token', {});
      setConnectToken(data.accessToken);
      setIsOpen(true);
    } catch (error) {
      console.error('Error creating token:', error);
      onError?.('Falha ao criar token de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async (_data: { item: Item }) => {
    setIsOpen(false);
    onSuccess?.();
  };

  const handleError = (error: { message?: string }) => {
    console.error('Pluggy Connect error:', error);
    onError?.(error.message || 'Falha na conexão');
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setConnectToken(null);
  };

  return (
    <>
      <button
        onClick={handleOpenConnect}
        disabled={isLoading}
        className={
          className ||
          'flex items-center gap-2 rounded-lg bg-[#58a6ff] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[#79b8ff] disabled:opacity-50 disabled:cursor-not-allowed'
        }
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <PlusCircle size={16} />
        )}
        {!iconOnly && (
          <span>
            {isLoading ? 'Conectando...' : label || 'Conectar Conta'}
          </span>
        )}
      </button>

      {typeof window !== 'undefined' && connectToken && isOpen && (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={handleClose}
        />
      )}
    </>
  );
}
