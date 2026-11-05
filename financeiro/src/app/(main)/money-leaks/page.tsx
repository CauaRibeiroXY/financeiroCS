'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import {
  Flame,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Coffee,
  Tv,
  Bike,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';
import type { MoneyLeaksAnalysis, MoneyLeakItem, LeakCategory } from '@/app/lib/services/money-leaks';

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => (res.success ? (res.data as MoneyLeaksAnalysis) : null));

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  return `${MONTHS[Number(month) - 1]}/${year.slice(2)}`;
}

function shiftPeriod(period: string, delta: number) {
  const [year, month] = period.split('-').map(Number);
  const total = year * 12 + (month - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function categoryIcon(category: LeakCategory) {
  switch (category) {
    case 'BANK_FEES':
      return <DollarSign size={16} className="text-[#f85149]" />;
    case 'MICRO_EXPENSES':
      return <Coffee size={16} className="text-[#d29922]" />;
    case 'DELIVERY_TRANSPORT':
      return <Bike size={16} className="text-[#f0883e]" />;
    case 'SUBSCRIPTIONS':
      return <Tv size={16} className="text-[#a371f7]" />;
    case 'EXPENSE_SURGE':
      return <TrendingDown size={16} className="text-[#f85149]" />;
    default:
      return <AlertTriangle size={16} className="text-[#58a6ff]" />;
  }
}

export default function MoneyLeaksPage() {
  const [period, setPeriod] = useState(currentPeriod());
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | LeakCategory>('ALL');
  const [expandedLeaks, setExpandedLeaks] = useState<Record<string, boolean>>({});
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useSWR(`/api/money-leaks?period=${period}`, fetcher);

  const toggleExpand = (id: string) => {
    setExpandedLeaks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const analysis = data;
  const items = analysis?.items ?? [];
  const filteredItems = selectedFilter === 'ALL'
    ? items
    : items.filter((item) => item.category === selectedFilter);

  const leakScore = analysis?.leakScore ?? 100;
  const scoreColor =
    leakScore >= 80 ? 'text-[#3fb950]' : leakScore >= 60 ? 'text-[#d29922]' : 'text-[#f85149]';
  const scoreBg =
    leakScore >= 80 ? 'bg-[#3fb950]/10 border-[#3fb950]/30' : leakScore >= 60 ? 'bg-[#d29922]/10 border-[#d29922]/30' : 'bg-[#f85149]/10 border-[#f85149]/30';

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#e6edf3]">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f85149]/10 border border-[#f85149]/30 flex items-center justify-center text-[#f85149]">
            <Flame size={18} />
          </div>
          <div>
            <h1 className="text-[#e6edf3] font-semibold text-base flex items-center gap-2">
              Onde Estou Perdendo Dinheiro
              <span className="text-xs font-normal text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/20 px-2 py-0.5 rounded-full">
                Detector de Ralos
              </span>
            </h1>
            <p className="text-[#8b949e] text-xs">
              Diagnóstico de despesas invisíveis, tarifas bancárias, assinaturas duplicadas e efeito cafezinho
            </p>
          </div>
        </div>

        {/* Mês Navegador */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod(shiftPeriod(period, -1))}
            className="rounded-lg border border-[#30363d] p-1.5 text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-semibold text-[#e6edf3] min-w-[75px] text-center">
            {formatPeriod(period)}
          </span>
          <button
            onClick={() => setPeriod(shiftPeriod(period, 1))}
            className="rounded-lg border border-[#30363d] p-1.5 text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] transition-colors"
            title="Próximo mês"
          >
            <ChevronRight size={14} />
          </button>
          {period !== currentPeriod() && (
            <button
              onClick={() => setPeriod(currentPeriod())}
              className="text-xs text-[#58a6ff] hover:underline ml-1"
            >
              mês atual
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total em Ralos */}
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">
                Vazamentos Identificados
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#f85149]">
                  {formatCurrency(analysis?.totalLeakingAmount ?? 0)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#8b949e] mt-2 pt-2 border-t border-[#30363d]/50">
              Corresponde a <strong className="text-white">{analysis?.leakingPercentage ?? 0}%</strong> de todas as despesas do mês ({formatCurrency(analysis?.totalExpenses ?? 0)}).
            </p>
          </div>

          {/* Economia Anual Projetada */}
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">
                Economia Potencial Anual
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#3fb950]">
                  {formatCurrency(analysis?.potentialAnnualSavings ?? 0)}
                </span>
                <span className="text-xs text-[#8b949e]">/ano</span>
              </div>
            </div>
            <p className="text-[11px] text-[#8b949e] mt-2 pt-2 border-t border-[#30363d]/50">
              Valor recuperado se você estancar esses vazamentos ao longo de 12 meses.
            </p>
          </div>

          {/* Score de Saúde */}
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">
                Controle de Ralos
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className={`text-2xl font-bold ${scoreColor}`}>{leakScore}/100</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${scoreBg} ${scoreColor} font-semibold`}>
                  {leakScore >= 80 ? 'Excelente' : leakScore >= 60 ? 'Alerta' : 'Crítico'}
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-[#30363d]/50">
              <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    leakScore >= 80 ? 'bg-[#3fb950]' : leakScore >= 60 ? 'bg-[#d29922]' : 'bg-[#f85149]'
                  }`}
                  style={{ width: `${leakScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Atalho Inteligente para o Assistente IA */}
          <div className="rounded-xl border border-[#58a6ff]/30 bg-[#58a6ff]/5 p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#58a6ff] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} /> Consultoria com IA
              </span>
              <p className="text-xs text-[#e6edf3] mt-1 font-medium">
                Deseja um plano detalhado para cortar esses gastos?
              </p>
            </div>
            <Link
              href="/ai"
              className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#58a6ff] hover:bg-[#79b8ff] text-black text-xs font-semibold transition-colors"
            >
              Pedir Estratégia à IA <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Insights Rápidos */}
        {analysis?.insights && analysis.insights.length > 0 && (
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
            <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-[#d29922]" />
              Diagnóstico Resumido do Mês
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#e6edf3]">
              {analysis.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-[#0d1117]/60 p-2.5 rounded-lg border border-[#30363d]/50">
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros por Tipo de Ralo */}
        <div className="flex flex-wrap gap-2 pt-2 border-b border-[#30363d] pb-4">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'ALL'
                ? 'bg-[#238636] text-white'
                : 'bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
            }`}
          >
            Todos os Ralos ({items.length})
          </button>
          <button
            onClick={() => setSelectedFilter('BANK_FEES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'BANK_FEES'
                ? 'bg-[#238636] text-white'
                : 'bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
            }`}
          >
            <DollarSign size={13} /> Tarifas & Juros
          </button>
          <button
            onClick={() => setSelectedFilter('MICRO_EXPENSES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'MICRO_EXPENSES'
                ? 'bg-[#238636] text-white'
                : 'bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
            }`}
          >
            <Coffee size={13} /> Efeito Cafezinho
          </button>
          <button
            onClick={() => setSelectedFilter('DELIVERY_TRANSPORT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'DELIVERY_TRANSPORT'
                ? 'bg-[#238636] text-white'
                : 'bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
            }`}
          >
            <Bike size={13} /> Delivery & Apps
          </button>
          <button
            onClick={() => setSelectedFilter('SUBSCRIPTIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'SUBSCRIPTIONS'
                ? 'bg-[#238636] text-white'
                : 'bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
            }`}
          >
            <Tv size={13} /> Assinaturas
          </button>
          <button
            onClick={() => setSelectedFilter('EXPENSE_SURGE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'EXPENSE_SURGE'
                ? 'bg-[#238636] text-white'
                : 'bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
            }`}
          >
            <TrendingDown size={13} /> Estouro de Gastos
          </button>
        </div>

        {/* Lista de Ralos Detectados */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-12 text-center">
              <ShieldCheck size={40} className="mx-auto text-[#3fb950] mb-3" />
              <h3 className="text-base font-semibold text-[#e6edf3]">
                Nenhum ralo encontrado neste filtro em {formatPeriod(period)}
              </h3>
              <p className="text-xs text-[#8b949e] mt-1 max-w-md mx-auto">
                Não foram detectados vazamentos graves correspondentes a este critério. Continue mantendo seus gastos sob controle!
              </p>
            </div>
          ) : (
            filteredItems.map((item: MoneyLeakItem) => {
              const isExpanded = !!expandedLeaks[item.id];
              const isDone = !!completedActions[item.id];

              const badgeColor =
                item.severity === 'CRITICAL'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : item.severity === 'WARNING'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400';

              const severityLabel =
                item.severity === 'CRITICAL'
                  ? 'Crítico (100% Evitável)'
                  : item.severity === 'WARNING'
                  ? 'Atenção (Gasto Excessivo)'
                  : 'Oportunidade de Otimização';

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden transition-all"
                >
                  {/* Top Bar do Card */}
                  <div className="p-5 flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center shrink-0 mt-0.5">
                        {categoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-[#e6edf3]">{item.title}</h3>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {severityLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[#8b949e] mt-1">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-right">
                        <span className="text-base font-bold text-[#f85149] tabular-nums">
                          {formatCurrency(item.amount)}
                        </span>
                        <p className="text-[10px] text-[#8b949e]">{item.occurrences}x lançamento(s)</p>
                      </div>
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1.5 rounded-lg border border-[#30363d] hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                        title={isExpanded ? 'Ocultar detalhes' : 'Ver transações'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Caixa de Ação Recomendada */}
                  <div className="px-5 py-3 bg-[#0d1117]/50 border-t border-[#30363d]/60 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 text-xs">
                      <Lightbulb size={15} className="text-[#58a6ff] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#58a6ff]">Como estancar este ralo: </strong>
                        <span className="text-[#e6edf3]">{item.actionTip}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAction(item.id)}
                      className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 shrink-0 transition-colors ${
                        isDone
                          ? 'bg-[#238636]/20 border-[#238636] text-green-400 font-semibold'
                          : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      {isDone ? 'Estancado!' : 'Marcar resolvido'}
                    </button>
                  </div>

                  {/* Lançamentos Detalhados (Acordeão) */}
                  {isExpanded && item.transactions && item.transactions.length > 0 && (
                    <div className="px-5 py-4 border-t border-[#30363d] bg-[#0d1117]/30">
                      <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
                        Transações que compõem este ralo ({item.transactions.length})
                      </h4>
                      <div className="overflow-x-auto rounded-lg border border-[#30363d]">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#21262d] text-[#8b949e]">
                            <tr>
                              <th className="px-3 py-2">Data</th>
                              <th className="px-3 py-2">Descrição</th>
                              <th className="px-3 py-2">Categoria</th>
                              <th className="px-3 py-2 text-right">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#30363d] bg-[#161b22]">
                            {item.transactions.map((tx, tIdx) => (
                              <tr key={tIdx} className="hover:bg-[#21262d]/50">
                                <td className="px-3 py-2 text-[#8b949e] whitespace-nowrap">
                                  {tx.date.split('-').reverse().join('/')}
                                </td>
                                <td className="px-3 py-2 text-[#e6edf3] font-medium">{tx.description}</td>
                                <td className="px-3 py-2 text-[#8b949e]">{tx.category || 'Geral'}</td>
                                <td className="px-3 py-2 text-right font-semibold text-[#f85149] tabular-nums">
                                  {formatCurrency(tx.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Checklist de Estancamento */}
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#58a6ff]" />
            <h2 className="text-sm font-semibold text-[#e6edf3]">
              Checklist Prático para Estancar Sangrias Financeiras
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#58a6ff]/50 transition-colors">
              <input type="checkbox" className="mt-0.5 rounded border-[#30363d] text-[#238636] focus:ring-0" />
              <div>
                <strong className="text-[#e6edf3] block">Isenção de Tarifas Bancárias</strong>
                <span className="text-[#8b949e]">Ligue para o seu banco ou acesse o app e selecione o Pacote de Serviços Essenciais (gratuito por lei).</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#58a6ff]/50 transition-colors">
              <input type="checkbox" className="mt-0.5 rounded border-[#30363d] text-[#238636] focus:ring-0" />
              <div>
                <strong className="text-[#e6edf3] block">Revisão de Assinaturas de Streaming</strong>
                <span className="text-[#8b949e]">Pause assinaturas que você não assistiu nos últimos 30 dias ou crie plano familiar.</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#58a6ff]/50 transition-colors">
              <input type="checkbox" className="mt-0.5 rounded border-[#30363d] text-[#238636] focus:ring-0" />
              <div>
                <strong className="text-[#e6edf3] block">Teto para Delivery de Comida</strong>
                <span className="text-[#8b949e]">Limite pedidos de iFood a 1 ou 2 vezes na semana para estancar micro-gastos acumulados.</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] cursor-pointer hover:border-[#58a6ff]/50 transition-colors">
              <input type="checkbox" className="mt-0.5 rounded border-[#30363d] text-[#238636] focus:ring-0" />
              <div>
                <strong className="text-[#e6edf3] block">Filtro das 72 Horas para Compras</strong>
                <span className="text-[#8b949e]">Espere 3 dias antes de realizar qualquer compra não essencial acima de R$ 100.</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
