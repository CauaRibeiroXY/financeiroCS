'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  CreditCard,
  Repeat,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';

type CommitmentKind = 'MANUAL' | 'SUBSCRIPTION' | 'INSTALLMENT' | 'VARIABLE_RECURRING';

interface Commitment {
  id: string;
  key: string;
  kind: CommitmentKind;
  title: string;
  amount: number;
  dueDay: number;
  category: string;
  isAuto: boolean;
  isPaid: boolean;
  origin: 'CREDIT' | 'BANK' | 'MANUAL';
  occurrences?: number;
  confidence: number;
  installments?: { current: number; total: number; remaining: number; endsAt: string };
}

interface CommitmentsPayload {
  period: string;
  items: Commitment[];
  totals: { total: number; byKind: Record<CommitmentKind, number> };
  projection: Array<{ period: string; total: number; itemCount: number }>;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => (res.success ? (res.data as CommitmentsPayload) : null));

const KIND_LABEL: Record<CommitmentKind, string> = {
  MANUAL: 'Manual',
  SUBSCRIPTION: 'Assinatura',
  INSTALLMENT: 'Parcela',
  VARIABLE_RECURRING: 'Recorrente',
};

const KIND_STYLE: Record<CommitmentKind, string> = {
  MANUAL: 'bg-[#8b949e]/10 text-[#8b949e]',
  SUBSCRIPTION: 'bg-[#a371f7]/10 text-[#a371f7]',
  INSTALLMENT: 'bg-[#f0883e]/10 text-[#f0883e]',
  VARIABLE_RECURRING: 'bg-[#58a6ff]/10 text-[#58a6ff]',
};

function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  const names = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${names[Number(month) - 1]}/${year.slice(2)}`;
}

function shiftPeriod(period: string, delta: number) {
  const [year, month] = period.split('-').map(Number);
  const total = year * 12 + (month - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

export function FixedExpensesCard() {
  const [period, setPeriod] = useState<string | null>(null);
  // Primeiro mês da barra de navegação. Só é fixado quando a navegação sai da
  // janela padrão; até lá o servidor decide (mês corrente - 3).
  const [from, setFrom] = useState<string | null>(null);

  const query = new URLSearchParams();
  if (period) query.set('period', period);
  if (from) query.set('from', from);
  const url = `/api/fixed-expenses${query.size ? `?${query}` : ''}`;

  const { data, isLoading } = useSWR(url, fetcher);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', due_day: '' });

  if (isLoading) return <SkeletonCard />;

  const items = data?.items ?? [];
  const totals = data?.totals;
  const projection = data?.projection ?? [];
  const activePeriod = data?.period ?? '';

  // O total do mês exclui o que já foi quitado — é o que ainda vai sair do bolso.
  const remaining = items.filter((i) => !i.isPaid).reduce((s, i) => s + i.amount, 0);
  // O mês seguinte ao selecionado dentro da projeção, que começa antes dele.
  const activeIndex = projection.findIndex((p) => p.period === activePeriod);
  const nextMonth = activeIndex >= 0 ? projection[activeIndex + 1] : undefined;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const maxProjected = Math.max(...projection.map((p) => p.total), 1);

  /** Seleciona um mês, arrastando a janela de projeção se ele cair fora dela. */
  function goToPeriod(target: string) {
    setPeriod(target);

    const first = projection[0]?.period;
    const last = projection[projection.length - 1]?.period;

    if (first && target < first) {
      setFrom(shiftPeriod(target, -1));
    } else if (last && target > last) {
      setFrom(shiftPeriod(target, -(projection.length - 2)));
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.amount) return;

    await fetch('/api/fixed-expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        amount: Number(form.amount),
        due_day: Number(form.due_day) || 10,
      }),
    });

    setForm({ title: '', amount: '', due_day: '' });
    setShowForm(false);
    mutate(url);
  }

  async function togglePaid(item: Commitment) {
    await fetch('/api/fixed-expenses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: item.key,
        period: activePeriod,
        paid: !item.isPaid,
        amount: item.amount,
      }),
    });
    mutate(url);
  }

  async function handleDelete(item: Commitment) {
    const params = new URLSearchParams({ id: item.id, key: item.key, title: item.title });
    await fetch(`/api/fixed-expenses?${params}`, { method: 'DELETE' });
    mutate(url);
  }

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
            Gastos Fixos & Recorrentes
          </span>
          <Calendar size={13} className="text-[#8b949e]" />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-[#238636] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#2ea043] transition-colors"
        >
          <Plus size={14} /> {showForm ? 'Fechar' : 'Adicionar'}
        </button>
      </div>

      {/* Métrica principal */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPeriod(shiftPeriod(activePeriod, -1))}
              className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <p className="text-[#8b949e] text-xs">
              Falta pagar em {activePeriod ? formatPeriod(activePeriod) : '--'}
            </p>
            <button
              onClick={() => goToPeriod(shiftPeriod(activePeriod, 1))}
              className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              title="Próximo mês"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <p className="text-[#e6edf3] text-2xl font-bold mt-0.5">{formatCurrency(remaining)}</p>
          {totals && totals.total !== remaining && (
            <p className="text-[#8b949e] text-[11px] mt-0.5">
              Total comprometido: {formatCurrency(totals.total)}
            </p>
          )}
        </div>
        {nextMonth && (
          <div className="text-right">
            <p className="text-[#8b949e] text-[11px]">{formatPeriod(nextMonth.period)}</p>
            <p className="text-[#e6edf3] text-sm font-semibold">{formatCurrency(nextMonth.total)}</p>
            <p className="text-[#8b949e] text-[10px]">{nextMonth.itemCount} itens</p>
          </div>
        )}
      </div>

      {/* Composição */}
      {totals && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
          {(Object.keys(KIND_LABEL) as CommitmentKind[])
            .filter((kind) => totals.byKind[kind] > 0)
            .map((kind) => (
              <span key={kind} className="text-[#8b949e]">
                {KIND_LABEL[kind]}:{' '}
                <span className="text-[#e6edf3] font-medium">
                  {formatCurrency(totals.byKind[kind])}
                </span>
              </span>
            ))}
        </div>
      )}

      {/* Linha do tempo: meses passados à esquerda, projeção à direita */}
      {projection.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {projection.map((p) => {
            const isActive = p.period === activePeriod;
            const isPast = p.period < thisMonth;
            return (
              <button
                key={p.period}
                onClick={() => goToPeriod(p.period)}
                title={`${formatPeriod(p.period)} — ${formatCurrency(p.total)}`}
                className="flex flex-col items-center gap-1 min-w-[34px] group"
              >
                <div className="h-10 w-full flex items-end">
                  <div
                    className={`w-full rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#58a6ff]'
                        : isPast
                          ? 'bg-[#30363d]/50 group-hover:bg-[#484f58]'
                          : 'bg-[#30363d] group-hover:bg-[#484f58]'
                    }`}
                    style={{ height: `${Math.max(6, (p.total / maxProjected) * 100)}%` }}
                  />
                </div>
                <span
                  className={`text-[9px] whitespace-nowrap ${
                    isActive
                      ? 'text-[#58a6ff]'
                      : p.period === thisMonth
                        ? 'text-[#e6edf3]'
                        : 'text-[#8b949e]'
                  }`}
                >
                  {formatPeriod(p.period)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Formulário rápido */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="flex flex-wrap gap-2 bg-[#0d1117] p-3 rounded-lg border border-[#30363d]"
        >
          <input
            placeholder="Nome (ex: Aluguel)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="flex-1 min-w-[140px] rounded border border-[#30363d] bg-[#161b22] px-2 py-1 text-xs text-white"
          />
          <input
            type="number"
            step="0.01"
            placeholder="R$ Valor"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-24 rounded border border-[#30363d] bg-[#161b22] px-2 py-1 text-xs text-white"
          />
          <input
            type="number"
            placeholder="Dia"
            value={form.due_day}
            onChange={(e) => setForm({ ...form, due_day: e.target.value })}
            className="w-14 rounded border border-[#30363d] bg-[#161b22] px-2 py-1 text-xs text-white"
          />
          <button
            type="submit"
            className="rounded bg-[#58a6ff] px-3 py-1 text-xs font-semibold text-black"
          >
            Salvar
          </button>
        </form>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-[#8b949e] text-xs text-center py-4">
            Nenhum compromisso neste mês.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between text-sm border-b border-[#21262d] pb-2 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-2 min-w-0">
                <button
                  onClick={() => togglePaid(item)}
                  className="mt-0.5 shrink-0 text-[#8b949e] hover:text-[#3fb950] transition-colors"
                  title={item.isPaid ? 'Marcar como não pago' : 'Marcar como pago'}
                >
                  {item.isPaid ? (
                    <CheckCircle2 size={14} className="text-[#3fb950]" />
                  ) : (
                    <Circle size={14} />
                  )}
                </button>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-medium text-xs truncate ${
                        item.isPaid ? 'text-[#8b949e] line-through' : 'text-[#e6edf3]'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${KIND_STYLE[item.kind]}`}
                    >
                      {KIND_LABEL[item.kind]}
                    </span>
                    {item.origin === 'CREDIT' && (
                      <span title="Cartão de crédito" className="flex items-center">
                        <CreditCard size={11} className="text-[#8b949e]" />
                      </span>
                    )}
                    {item.kind === 'SUBSCRIPTION' && item.origin !== 'CREDIT' && (
                      <Repeat size={11} className="text-[#8b949e]" />
                    )}
                  </div>
                  <span className="text-[#8b949e] text-[11px]">
                    Vence dia {item.dueDay}
                    {item.installments
                      ? ` · faltam ${item.installments.remaining}x (até ${formatPeriod(
                          item.installments.endsAt
                        )})`
                      : item.occurrences
                        ? ` · ${item.occurrences}x no histórico`
                        : ''}
                    {item.isAuto && item.confidence < 0.8 ? ' · confirmar' : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[#e6edf3] text-xs font-semibold">
                  {formatCurrency(item.amount)}
                </span>
                <button
                  onClick={() => handleDelete(item)}
                  className="text-[#8b949e] hover:text-[#f85149] transition-colors"
                  title="Remover / ignorar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
