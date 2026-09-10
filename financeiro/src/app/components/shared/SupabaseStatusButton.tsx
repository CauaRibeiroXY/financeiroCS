'use client';

import { useState } from 'react';
import { Database, Loader2, Check, X } from 'lucide-react';
import { cn } from '@/app/lib/utils/cn';

interface TableCheck {
  table: string;
  ok: boolean;
  rows: number | null;
  error: string | null;
}

interface HealthResponse {
  ok: boolean;
  status: 'healthy' | 'degraded' | 'unreachable' | 'misconfigured';
  message: string;
  latencyMs: number;
  tables: TableCheck[];
}

interface SupabaseStatusButtonProps {
  className?: string;
  iconOnly?: boolean;
}

export function SupabaseStatusButton({ className, iconOnly = false }: SupabaseStatusButtonProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<HealthResponse | null>(null);

  const handleCheck = async () => {
    if (isChecking) return;

    setIsChecking(true);
    setResult(null);

    try {
      const res = await fetch('/api/health/supabase', { cache: 'no-store' });
      const data = (await res.json()) as HealthResponse;
      setResult(data);
    } catch (err) {
      setResult({
        ok: false,
        status: 'unreachable',
        message: err instanceof Error ? err.message : 'Falha ao contatar o servidor',
        latencyMs: 0,
        tables: [],
      });
    } finally {
      setIsChecking(false);
    }
  };

  const label = isChecking
    ? 'Verificando...'
    : result
      ? result.ok
        ? `Supabase OK · ${result.latencyMs}ms`
        : 'Supabase com erro'
      : 'Testar Supabase';

  const tooltip = result
    ? `${result.message}${
        result.tables.length > 0
          ? '\n\n' +
            result.tables
              .map((t) => `${t.ok ? '✓' : '✗'} ${t.table}${t.error ? ` — ${t.error}` : ''}`)
              .join('\n')
          : ''
      }`
    : 'Verificar conexão com o Supabase';

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleCheck}
        disabled={isChecking}
        title={tooltip}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all border border-[#30363d]',
          isChecking
            ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed'
            : result?.ok
              ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/40'
              : result
                ? 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/40'
                : 'bg-[#161b22] text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]',
          className
        )}
      >
        {isChecking ? (
          <Loader2 size={16} className="animate-spin" />
        ) : result?.ok ? (
          <Check size={16} />
        ) : result ? (
          <X size={16} />
        ) : (
          <Database size={16} />
        )}
        {!iconOnly && <span className="truncate">{label}</span>}
      </button>

      {!iconOnly && result && !result.ok && (
        <p className="px-1 text-[11px] leading-snug text-[#f85149] break-words">
          {result.message}
        </p>
      )}

      {!iconOnly && result?.ok && result.tables.length > 0 && (
        <p className="px-1 text-[11px] leading-snug text-[#8b949e]">
          {result.tables.length} tabelas acessíveis
        </p>
      )}
    </div>
  );
}
