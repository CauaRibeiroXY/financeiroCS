'use client';

import { useState } from 'react';
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChevronDown, Info, Sliders } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils/format';

export interface ProjectionAssumptions {
  cdi: number;
  ipca: number;
  equity: number;
  monthlyContribution: number;
  months: number;
  scenarioSpread: number;
}

export interface ProjectionPoint {
  period: string;
  monthIndex: number;
  contributed: number;
  nominal: number;
  real: number;
  low: number;
  high: number;
}

interface Props {
  series: ProjectionPoint[];
  assumptions: ProjectionAssumptions;
  weightedAnnualRate: number;
  rateCoverage: { contracted: number; historical: number; assumed: number };
  total: number;
  finalNominal: number;
  finalReal: number;
  totalContributed: number;
  totalYield: number;
  /** Aplica novas premissas — dispara nova busca na API */
  onChange: (next: Partial<ProjectionAssumptions>) => void;
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  return `${MONTHS[Number(month) - 1]}/${year.slice(2)}`;
}

function compact(value: number) {
  if (Math.abs(value) >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (Math.abs(value) >= 1000) return `R$${(value / 1000).toFixed(0)}k`;
  return `R$${Math.round(value)}`;
}

function pct(value: number) {
  return `${(value * 100).toFixed(2).replace('.', ',')}%`;
}

const HORIZONS = [
  { label: '1 ano', months: 12 },
  { label: '3 anos', months: 36 },
  { label: '5 anos', months: 60 },
  { label: '10 anos', months: 120 },
  { label: '20 anos', months: 240 },
];

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ProjectionPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 shadow-lg space-y-1">
      <p className="text-[10px] text-[#8b949e]">{formatPeriod(point.period)}</p>
      <p className="text-xs font-semibold text-[#e6edf3]">{formatCurrency(point.nominal)}</p>
      <div className="text-[10px] text-[#8b949e] space-y-0.5 pt-1 border-t border-[#21262d]">
        <p>
          Poder de compra de hoje:{' '}
          <span className="text-[#e6edf3]">{formatCurrency(point.real)}</span>
        </p>
        <p>
          Aportado: <span className="text-[#e6edf3]">{formatCurrency(point.contributed)}</span>
        </p>
        <p>
          Cenários: {compact(point.low)} — {compact(point.high)}
        </p>
      </div>
    </div>
  );
}

/** Campo numérico compacto com sufixo. */
function Field({
  label,
  value,
  suffix,
  step = 0.1,
  onCommit,
}: {
  label: string;
  value: number;
  suffix: string;
  step?: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] text-[#8b949e]">{label}</span>
      <div className="flex items-center rounded border border-[#30363d] bg-[#0d1117] px-2">
        <input
          type="number"
          step={step}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const parsed = Number(draft);
            if (Number.isFinite(parsed)) onCommit(parsed);
            else setDraft(String(value));
          }}
          className="w-16 bg-transparent py-1 text-xs text-[#e6edf3] outline-none"
        />
        <span className="text-[10px] text-[#8b949e]">{suffix}</span>
      </div>
    </label>
  );
}

export function ProjectionPanel({
  series,
  assumptions,
  weightedAnnualRate,
  rateCoverage,
  total,
  finalNominal,
  finalReal,
  totalContributed,
  totalYield,
  onChange,
}: Props) {
  const [showMethod, setShowMethod] = useState(false);

  const coverageTotal =
    rateCoverage.contracted + rateCoverage.historical + rateCoverage.assumed || 1;
  const contractedShare = rateCoverage.contracted / coverageTotal;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-[#e6edf3]">Projeção da carteira</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Taxa média da carteira: {pct(weightedAnnualRate)} a.a. — {Math.round(contractedShare * 100)}%
            do valor tem taxa contratada
          </p>
        </div>

        <div className="flex gap-1">
          {HORIZONS.map((h) => (
            <button
              key={h.months}
              onClick={() => onChange({ months: h.months })}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                assumptions.months === h.months
                  ? 'bg-[#238636] text-white'
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado no fim do horizonte */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#30363d]">
        {[
          { label: 'Hoje', value: total, hint: 'valor atual da carteira' },
          { label: 'Total aportado', value: totalContributed, hint: 'posição inicial + aportes' },
          { label: 'Rendimento', value: totalYield, hint: 'juros acumulados no período' },
          {
            label: `Em ${assumptions.months} meses`,
            value: finalNominal,
            hint: `${formatCurrency(finalReal)} em poder de compra de hoje`,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#161b22] px-5 py-3">
            <p className="text-[10px] text-[#8b949e]">{stat.label}</p>
            <p className="text-[#e6edf3] text-base font-semibold mt-0.5">
              {formatCurrency(stat.value)}
            </p>
            <p className="text-[10px] text-[#8b949e] mt-0.5">{stat.hint}</p>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="p-5">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="projBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#58a6ff" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#58a6ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="period"
                tick={{ fill: '#8b949e', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPeriod}
                minTickGap={40}
              />
              <YAxis
                tick={{ fill: '#8b949e', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={compact}
                width={52}
              />
              <Tooltip content={<ChartTooltip />} />

              {/* Banda de cenários: desenha o topo e apaga a base */}
              <Area
                dataKey="high"
                stroke="none"
                fill="url(#projBand)"
                isAnimationActive={false}
              />
              <Area dataKey="low" stroke="none" fill="#161b22" isAnimationActive={false} />

              <Line
                dataKey="contributed"
                stroke="#8b949e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="real"
                stroke="#a371f7"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="nominal"
                stroke="#58a6ff"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-4 mt-3">
          {[
            { color: '#58a6ff', label: 'Projeção (nominal)' },
            { color: '#a371f7', label: 'Poder de compra de hoje' },
            { color: '#8b949e', label: 'Total aportado', dashed: true },
          ].map((legend) => (
            <div key={legend.label} className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-4 rounded"
                style={{
                  backgroundColor: legend.color,
                  opacity: legend.dashed ? 0.6 : 1,
                }}
              />
              <span className="text-[11px] text-[#8b949e]">{legend.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-[#58a6ff]/20" />
            <span className="text-[11px] text-[#8b949e]">
              Cenários ±{Math.round(assumptions.scenarioSpread * 100)}% sobre a taxa
            </span>
          </div>
        </div>
      </div>

      {/* Premissas */}
      <div className="px-5 py-4 border-t border-[#30363d] bg-[#0d1117]/40">
        <div className="flex items-center gap-2 mb-3">
          <Sliders size={13} className="text-[#8b949e]" />
          <span className="text-xs font-medium text-[#e6edf3]">Premissas</span>
          <span className="text-[10px] text-[#8b949e]">— altere para simular outros cenários</span>
        </div>

        <div className="flex flex-wrap gap-4">
          <Field
            label="CDI / Selic"
            value={Number((assumptions.cdi * 100).toFixed(2))}
            suffix="% a.a."
            onCommit={(v) => onChange({ cdi: v })}
          />
          <Field
            label="IPCA"
            value={Number((assumptions.ipca * 100).toFixed(2))}
            suffix="% a.a."
            onCommit={(v) => onChange({ ipca: v })}
          />
          <Field
            label="Renda variável"
            value={Number((assumptions.equity * 100).toFixed(2))}
            suffix="% a.a."
            onCommit={(v) => onChange({ equity: v })}
          />
          <Field
            label="Aporte mensal"
            value={assumptions.monthlyContribution}
            suffix="R$"
            step={50}
            onCommit={(v) => onChange({ monthlyContribution: v })}
          />
          <Field
            label="Banda de cenários"
            value={Number((assumptions.scenarioSpread * 100).toFixed(0))}
            suffix="%"
            step={5}
            onCommit={(v) => onChange({ scenarioSpread: v })}
          />
        </div>
      </div>

      {/* Metodologia */}
      <div className="border-t border-[#30363d]">
        <button
          onClick={() => setShowMethod(!showMethod)}
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-[#1c2128] transition-colors"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-[#e6edf3]">
            <Info size={13} className="text-[#58a6ff]" />
            Como esta projeção é calculada
          </span>
          <ChevronDown
            size={14}
            className={`text-[#8b949e] transition-transform ${showMethod ? 'rotate-180' : ''}`}
          />
        </button>

        {showMethod && (
          <div className="px-5 pb-5 text-xs text-[#8b949e] leading-relaxed space-y-4">
            <div>
              <p className="text-[#e6edf3] font-medium mb-1">1. Taxa de cada posição</p>
              <p>
                Para cada investimento, a taxa anual sai da primeira fonte disponível, nesta ordem:
              </p>
              <ul className="mt-1.5 space-y-1 pl-4">
                <li className="list-disc">
                  <span className="text-[#3fb950]">Contratada</span> — a remuneração do próprio
                  papel. <code className="text-[#e6edf3]">110% do CDI</code> vira{' '}
                  {pct(assumptions.cdi)} × 1,10.{' '}
                  <code className="text-[#e6edf3]">IPCA + 5%</code> vira {pct(assumptions.ipca)} +
                  5%. Prefixado usa a própria taxa.
                </li>
                <li className="list-disc">
                  <span className="text-[#e3b341]">Histórica</span> — quando não há taxa contratada,
                  usa o retorno dos últimos 12 meses da posição.
                </li>
                <li className="list-disc">
                  <span className="text-[#f0883e]">Presumida</span> — sem taxa nem histórico, aplica
                  a premissa da classe: {pct(assumptions.equity)} a.a. para renda variável,{' '}
                  {pct(assumptions.cdi)} a.a. para o resto.
                </li>
              </ul>
              <p className="mt-1.5">
                Hoje, <span className="text-[#e6edf3]">{Math.round(contractedShare * 100)}%</span> do
                valor da carteira usa taxa contratada. Quanto maior esse número, mais firme é a
                projeção.
              </p>
            </div>

            <div>
              <p className="text-[#e6edf3] font-medium mb-1">2. Taxa da carteira</p>
              <p>
                Média das taxas ponderada pelo valor de cada posição — hoje{' '}
                <span className="text-[#e6edf3]">{pct(weightedAnnualRate)} ao ano</span>. Uma posição
                grande a 10% pesa mais que uma pequena a 20%.
              </p>
            </div>

            <div>
              <p className="text-[#e6edf3] font-medium mb-1">3. Evolução mês a mês</p>
              <p>
                Juros compostos sobre o saldo, com o aporte entrando ao fim de cada mês:
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-[#e6edf3] bg-[#0d1117] border border-[#30363d] rounded px-3 py-2">
                saldo = saldo × (1 + i) + aporte
              </p>
              <p className="mt-1.5">
                Onde <code className="text-[#e6edf3]">i</code> é a taxa mensal equivalente à anual:{' '}
                <code className="text-[#e6edf3]">(1 + taxa_anual)^(1/12) − 1</code>. Não é a taxa
                anual dividida por 12 — isso subestimaria o juro composto.
              </p>
            </div>

            <div>
              <p className="text-[#e6edf3] font-medium mb-1">4. Linhas do gráfico</p>
              <ul className="space-y-1 pl-4">
                <li className="list-disc">
                  <span className="text-[#58a6ff]">Nominal</span> — o número que vai aparecer no
                  extrato.
                </li>
                <li className="list-disc">
                  <span className="text-[#a371f7]">Poder de compra de hoje</span> — o nominal
                  descontada a inflação de {pct(assumptions.ipca)} a.a. É o que esse dinheiro compra
                  em produtos de hoje.
                </li>
                <li className="list-disc">
                  <span className="text-[#8b949e]">Total aportado</span> — quanto saiu do seu bolso.
                  A distância até a linha azul é o rendimento.
                </li>
                <li className="list-disc">
                  A faixa sombreada aplica ±{Math.round(assumptions.scenarioSpread * 100)}% sobre a
                  taxa, para mostrar a sensibilidade do resultado a um erro na premissa.
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-[#21262d]">
              <p className="text-[#e6edf3] font-medium mb-1">O que a projeção não considera</p>
              <ul className="space-y-1 pl-4">
                <li className="list-disc">
                  <span className="text-[#f85149]">Imposto de renda e IOF.</span> A alíquota depende
                  do prazo de cada resgate, então os valores são brutos. Em renda fixa tributada,
                  conte com 15% a 22,5% sobre o rendimento.
                </li>
                <li className="list-disc">
                  <span className="text-[#f85149]">Vencimentos.</span> Papéis que vencem são tratados
                  como reinvestidos à mesma taxa média. Se as taxas caírem, o resultado real fica
                  abaixo da projeção.
                </li>
                <li className="list-disc">
                  <span className="text-[#f85149]">Volatilidade.</span> Renda variável entra pela
                  taxa média, então a linha é lisa. O caminho real oscila — só o destino aproximado
                  é estimado.
                </li>
                <li className="list-disc">
                  <span className="text-[#f85149]">Mudança de CDI e IPCA.</span> As premissas são
                  fixas ao longo de todo o horizonte.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
