'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { TrendingUp } from 'lucide-react';
import { SkeletonCard } from '@/app/components/shared/Skeleton';
import { PortfolioOverview } from '@/app/components/investments/PortfolioOverview';
import { PositionsTable, type Position } from '@/app/components/investments/PositionsTable';
import {
  ProjectionPanel,
  type ProjectionAssumptions,
  type ProjectionPoint,
} from '@/app/components/investments/ProjectionPanel';
import type { AllocationSlice, MaturityBucket } from '@/app/components/investments/PortfolioOverview';

interface PortfolioAnalysis {
  total: number;
  totalInvested: number | null;
  totalProfit: number | null;
  totalProfitRate: number | null;
  totalWithdrawable: number | null;
  positions: Position[];
  byType: AllocationSlice[];
  byInstitution: AllocationSlice[];
  byIndexer: AllocationSlice[];
  maturities: MaturityBucket[];
  weightedAnnualRate: number;
  rateCoverage: { contracted: number; historical: number; assumed: number };
  projection: {
    assumptions: ProjectionAssumptions;
    series: ProjectionPoint[];
    finalNominal: number;
    finalReal: number;
    totalContributed: number;
    totalYield: number;
  };
}

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => (res.success ? (res.data as PortfolioAnalysis) : null));

/** Premissas em % ao ano, como aparecem na interface. */
interface AssumptionsInput {
  cdi: number;
  ipca: number;
  equity: number;
  contribution: number;
  months: number;
  spread: number;
}

const INITIAL: AssumptionsInput = {
  cdi: 10.5,
  ipca: 4.5,
  equity: 10,
  contribution: 0,
  months: 60,
  spread: 25,
};

export default function InvestmentsPage() {
  const [input, setInput] = useState<AssumptionsInput>(INITIAL);

  const query = new URLSearchParams({
    cdi: String(input.cdi),
    ipca: String(input.ipca),
    equity: String(input.equity),
    contribution: String(input.contribution),
    months: String(input.months),
    spread: String(input.spread),
  });

  const { data, isLoading, error } = useSWR(`/api/portfolio?${query}`, fetcher, {
    keepPreviousData: true,
  });

  /** O painel devolve as premissas em decimal; a query trabalha em %. */
  function handleAssumptionsChange(next: Partial<ProjectionAssumptions>) {
    setInput((current) => ({
      cdi: next.cdi ?? current.cdi,
      ipca: next.ipca ?? current.ipca,
      equity: next.equity ?? current.equity,
      contribution: next.monthlyContribution ?? current.contribution,
      months: next.months ?? current.months,
      spread: next.scenarioSpread ?? current.spread,
    }));
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <TrendingUp size={18} className="text-[#8b949e]" />
          <h1 className="text-[#e6edf3] font-semibold text-base">Investimentos</h1>
        </div>
        <p className="text-xs text-[#8b949e]">Carteira, alocação e projeção</p>
      </header>

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {isLoading && !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error || !data ? (
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-8 text-center">
            <p className="text-[#f85149] text-sm font-medium">
              Não foi possível carregar a carteira
            </p>
            <p className="text-[#8b949e] text-xs mt-1">
              Verifique a conexão com o banco e tente sincronizar novamente.
            </p>
          </div>
        ) : (
          <>
            <PortfolioOverview
              total={data.total}
              totalInvested={data.totalInvested}
              totalProfit={data.totalProfit}
              totalProfitRate={data.totalProfitRate}
              totalWithdrawable={data.totalWithdrawable}
              positionCount={data.positions.length}
              byType={data.byType}
              byInstitution={data.byInstitution}
              byIndexer={data.byIndexer}
              maturities={data.maturities}
            />

            <ProjectionPanel
              series={data.projection.series}
              assumptions={data.projection.assumptions}
              weightedAnnualRate={data.weightedAnnualRate}
              rateCoverage={data.rateCoverage}
              total={data.total}
              finalNominal={data.projection.finalNominal}
              finalReal={data.projection.finalReal}
              totalContributed={data.projection.totalContributed}
              totalYield={data.projection.totalYield}
              onChange={handleAssumptionsChange}
            />

            <PositionsTable positions={data.positions} />
          </>
        )}
      </div>
    </div>
  );
}
