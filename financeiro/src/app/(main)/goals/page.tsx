'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  Info,
  Pencil,
  Target,
  Trash2,
  TrendingUp,
  Wallet2,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGoals } from '@/app/hooks/useGoals';
import { useDashboardData } from '@/app/hooks/useDashboardData';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Cores para as metas recém criadas
const GOAL_COLORS = ['#3fb950', '#58a6ff', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function GoalsPage() {
  // 1. DADOS REAIS DO BANCO (Patrimônio consolidado)
  const { patrimony, totalInvestments, isLoading: dashboardLoading } = useDashboardData();
  const investmentPool = patrimony + totalInvestments; // Usando a soma total do seu dinheiro como Pool
  
  // 2. DADOS DO SUPABASE (VIA SWR)
  const { goals, historyData, isLoading: goalsLoading, addGoal, editGoal, removeGoal } = useGoals();
  
  const [goalForm, setGoalForm] = useState({ title: '', target: '' });
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState({ title: '', target: '' });
  const [partialInput, setPartialInput] = useState<Record<number, string>>({});
  const [showForm, setShowForm] = useState(false);
  
  // Controles do Gráfico
  const [chartMode, setChartMode] = useState<'total' | 'specific'>('total');
  const [selectedGoalChartId, setSelectedGoalChartId] = useState<number | null>(null);

  // Estado local para garantir que a barra arraste sem lag
  const [localAllocations, setLocalAllocations] = useState<Record<number, number>>({});

  // --- LÓGICA DE ALOCAÇÃO E PROGRESSO ---
  const allocationTotal = useMemo(() => {
    return goals.reduce((sum, goal) => sum + (localAllocations[goal.id] ?? Number(goal.percent_allocation)), 0);
  }, [goals, localAllocations]);

  const unallocatedPercent = Math.max(0, 100 - allocationTotal);

  const goalSummaries = useMemo(() => {
    return goals.map((goal) => {
      // Usa o valor local enquanto arrasta, ou o do banco se não estiver arrastando
      const currentAlloc = localAllocations[goal.id] ?? Number(goal.percent_allocation);
      
      const allocatedValue = (investmentPool * currentAlloc) / 100;
      const totalAccumulated = allocatedValue + Number(goal.external_aporte);
      const targetAmount = Number(goal.target_amount);
      const progress = targetAmount > 0 ? Math.min(100, Math.round((totalAccumulated / targetAmount) * 100)) : 0;
      const remaining = Math.max(0, targetAmount - totalAccumulated);

      return {
        ...goal,
        percent_allocation: currentAlloc, // Substitui pelo valor ao vivo
        allocatedValue,
        totalAccumulated,
        progress,
        remaining,
      };
    });
  }, [goals, investmentPool, localAllocations]);

  // Resumo do painel superior
  const summary = useMemo(() => {
    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);
    const totalCurrent = goalSummaries.reduce((sum, goal) => sum + goal.totalAccumulated, 0);
    const avgProgress = goalSummaries.length
      ? Math.round(
          goalSummaries.reduce((sum, goal) => sum + goal.progress, 0) / goalSummaries.length
        )
      : 0;

    return { totalTarget, totalCurrent, avgProgress };
  }, [goals, goalSummaries]);

  const alerts = useMemo(() => {
    return goalSummaries
      .map((goal) => {
        if (goal.progress >= 100) {
          return { ...goal, type: 'success', message: 'Meta concluída!' };
        }
        if (goal.progress < 70) {
          return { ...goal, type: 'warning', message: `Atenção: Falta ${formatCurrency(goal.remaining)}.` };
        }
        return { ...goal, type: 'info', message: 'Em andamento' };
      })
      .sort((a, b) => {
        if (a.type === 'warning' && b.type !== 'warning') return -1;
        if (a.type !== 'warning' && b.type === 'warning') return 1;
        return 0;
      });
  }, [goalSummaries]);

  // --- LÓGICA DO GRÁFICO  ---
  const evolutionData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    const grouped: Record<string, any> = {};

    historyData.forEach((snap: any) => {
      const date = new Date(snap.snapshot_date);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); 
      const label = date.toLocaleDateString('pt-BR', { month: 'short' }); 

      if (!grouped[label]) {
        grouped[label] = { month: label, pool: investmentPool, metas: 0, specific: {} };
      }

      grouped[label].metas += Number(snap.total_accumulated);
      
      grouped[label].specific[snap.goal_id] = {
        acumulado: Number(snap.total_accumulated),
        alocado: Number(snap.pool_allocated_value)
      };
    });

    return Object.values(grouped).map((dataMonth: any) => {
      if (chartMode === 'total') {
        return {
          month: dataMonth.month,
          pool: dataMonth.pool, 
          metas: dataMonth.metas
        };
      } else {
        const activeChartId = selectedGoalChartId ?? goals[0]?.id;
        const metaData = dataMonth.specific[activeChartId] || { acumulado: 0, alocado: 0 };
        
        return {
          month: dataMonth.month,
          acumulado: metaData.acumulado,
          alocado: metaData.alocado
        };
      }
    });
  }, [historyData, chartMode, selectedGoalChartId, goals, investmentPool]);

  // --- FUNÇÕES DE MANIPULAÇÃO ---
  
  // Apenas altera a UI instantaneamente
  function handleGoalPercentChange(goalId: number, value: number) {
    const otherGoalsTotal = goals.filter(g => g.id !== goalId).reduce((sum, g) => sum + (localAllocations[g.id] ?? Number(g.percent_allocation)), 0);
    const maxAllowed = 100 - otherGoalsTotal;
    const safeValue = Math.min(Math.max(0, value), maxAllowed);

    setLocalAllocations(prev => ({ ...prev, [goalId]: safeValue }));
  }

  // Dispara apenas quando soltar o dedo/mouse
  function handleGoalPercentCommit(goalId: number) {
    const finalValue = localAllocations[goalId];
    if (finalValue !== undefined) {
      editGoal(goalId, { percent_allocation: finalValue });
    }
  }

  async function handleAddGoal(e: FormEvent) {
    e.preventDefault();
    if (!goalForm.title || !goalForm.target) return;

    const nextColorIndex = goals.length % GOAL_COLORS.length;

    await addGoal({
      title: goalForm.title,
      target_amount: Number(goalForm.target),
      external_aporte: 0,
      percent_allocation: 0,
      color: GOAL_COLORS[nextColorIndex],
    });

    setGoalForm({ title: '', target: '' });
    setShowForm(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function startEdit(goal: any) {
    setEditingGoalId(goal.id);
    setEditDraft({
      title: goal.title,
      target: String(goal.target_amount),
    });
  }

  function saveEdit(goalId: number) {
    editGoal(goalId, {
      title: editDraft.title,
      target_amount: Number(editDraft.target),
    });
    setEditingGoalId(null);
  }

  function handleAddExternalAporte(goalId: number, currentAporte: number) {
    const amount = Number(partialInput[goalId] || 0);
    if (!amount) return;

    editGoal(goalId, { external_aporte: Number(currentAporte) + amount });
    setPartialInput((prev) => ({ ...prev, [goalId]: '' }));
  }

  function handleDeleteGoal(goalId: number) {
    removeGoal(goalId);
    if (selectedGoalChartId === goalId) {
      setSelectedGoalChartId(null);
    }
  }

  // --- RENDERIZAÇÃO CONDICIONAL DE CARREGAMENTO ---
  const isLoading = goalsLoading || dashboardLoading;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-[#8b949e]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#58a6ff]"></div>
          <p>Sincronizando patrimônio e metas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <Target size={18} className="text-[#58a6ff]" />
          <div>
            <h1 className="text-[#e6edf3] font-semibold text-base">Gestor de Metas & Categorias</h1>
            <p className="text-xs text-[#8b949e]">Acompanhe seus objetivos com base no patrimônio investido.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
            <p className="text-[#8b949e] text-sm">Pool Total (Investimentos)</p>
            <p className="text-[#e6edf3] text-xl font-semibold mt-1">{formatCurrency(investmentPool)}</p>
          </div>
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
            <p className="text-[#8b949e] text-sm">Soma dos Alvos</p>
            <p className="text-[#e6edf3] text-xl font-semibold mt-1">{formatCurrency(summary.totalTarget)}</p>
          </div>
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
            <p className="text-[#8b949e] text-sm">Total Acumulado</p>
            <p className="text-[#e6edf3] text-xl font-semibold mt-1">{formatCurrency(summary.totalCurrent)}</p>
          </div>
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
            <p className="text-[#8b949e] text-sm">Progresso Médio</p>
            <p className="text-[#e6edf3] text-xl font-semibold mt-1">{summary.avgProgress}%</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Wallet2 size={16} className="text-[#58a6ff]" />
              <h2 className="text-[#e6edf3] font-semibold">Alocação das Categorias (Metas)</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#8b949e]">
                  Alocado: <span className="text-[#e6edf3]">{allocationTotal.toFixed(0)}%</span>
                </div>
                <div className={`rounded-lg border px-3 py-2 text-sm ${unallocatedPercent > 0 ? 'border-[#3fb950]/50 text-[#3fb950] bg-[#3fb950]/10' : 'border-[#30363d] text-[#8b949e] bg-[#0d1117]'}`}>
                  Livre: {unallocatedPercent.toFixed(0)}%
                </div>
              </div>
              <button onClick={() => setShowForm((prev) => !prev)} className="rounded-lg border border-[#30363d] bg-[#238636] px-3 py-2 text-sm text-white hover:bg-[#2ea043]">
                {showForm ? 'Cancelar' : 'Nova Categoria'}
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleAddGoal} className="mb-6 flex gap-3 bg-[#0d1117] p-4 rounded-xl border border-[#30363d]">
              <input value={goalForm.title} onChange={(e) => setGoalForm((p) => ({ ...p, title: e.target.value }))} placeholder="Nome da meta..." className="flex-1 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm text-[#e6edf3]" />
              <input type="number" value={goalForm.target} onChange={(e) => setGoalForm((p) => ({ ...p, target: e.target.value }))} placeholder="Valor alvo (R$)" className="flex-1 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm text-[#e6edf3]" />
              <button type="submit" className="rounded-lg bg-[#58a6ff] px-6 py-2 text-sm font-semibold text-black hover:bg-[#79b8ff]">Salvar Meta</button>
            </form>
          )}

          <div className="space-y-4">
            {goalSummaries.length === 0 && !showForm && (
              <div className="text-center py-6 text-[#8b949e]">
                Nenhuma meta criada. Clique em "Nova Categoria" para começar.
              </div>
            )}
            {goalSummaries.map((goal) => (
              <div key={goal.id} className="rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden">
                <div className="p-4 border-b border-[#30363d]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: goal.color }} />
                      <h3 className="text-[#e6edf3] font-medium text-lg">{goal.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(goal)} className="p-1.5 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 rounded hover:bg-[#f85149]/20 text-[#8b949e] hover:text-[#f85149] transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {editingGoalId === goal.id && (
                    <div className="mb-4 flex gap-2 bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
                      <input value={editDraft.title} onChange={(e) => setEditDraft(p => ({ ...p, title: e.target.value }))} className="flex-1 rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-sm text-white" placeholder="Título"/>
                      <input type="number" value={editDraft.target} onChange={(e) => setEditDraft(p => ({ ...p, target: e.target.value }))} className="flex-1 rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-sm text-white" placeholder="Alvo"/>
                      <button onClick={() => saveEdit(goal.id)} className="text-sm bg-[#58a6ff] text-black px-4 py-1 rounded">Salvar</button>
                      <button onClick={() => setEditingGoalId(null)} className="text-sm border border-[#30363d] text-white px-4 py-1 rounded">Cancelar</button>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.percent_allocation}
                      onChange={(e) => handleGoalPercentChange(goal.id, Number(e.target.value))}
                      onPointerUp={() => handleGoalPercentCommit(goal.id)}
                      className="flex-1 accent-[#58a6ff] cursor-pointer"
                    />
                    <div className="text-right min-w-[120px]">
                      <div className="text-[#e6edf3] font-medium">{Number(goal.percent_allocation).toFixed(0)}% da Pool</div>
                      <div className="text-xs text-[#8b949e]">{formatCurrency(goal.allocatedValue)}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#161b22]/30">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[#8b949e]">Progresso da Meta</span>
                    <span className="text-[#e6edf3] font-medium">{goal.progress}% concluído</span>
                  </div>
                  
                  <div className="h-2.5 rounded-full bg-[#21262d] overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-sm text-[#8b949e]">
                      Acumulado: <span className="text-[#e6edf3]">{formatCurrency(goal.totalAccumulated)}</span> 
                      <span className="mx-2">/</span> 
                      Alvo: <span className="text-[#e6edf3]">{formatCurrency(Number(goal.target_amount))}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-[#21262d] p-1.5 rounded-lg border border-[#30363d]">
                      <div className="flex items-center gap-1 px-2 text-xs text-[#8b949e]" title="Dinheiro físico ou extra que não está no banco">
                        <Info size={14} />
                        <span>Aporte Externo</span>
                      </div>
                      <input
                        type="number"
                        value={partialInput[goal.id] || ''}
                        onChange={(e) => setPartialInput((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                        placeholder="R$ 0,00"
                        className="w-24 rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-sm text-[#e6edf3]"
                      />
                      <button onClick={() => handleAddExternalAporte(goal.id, Number(goal.external_aporte))} className="rounded bg-[#30363d] px-3 py-1 text-sm text-[#e6edf3] hover:bg-[#484f58] transition-colors">
                        Somar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#58a6ff]" />
                <h2 className="text-[#e6edf3] font-semibold">Evolução</h2>
              </div>
              <div className="flex gap-2">
                <div className="flex bg-[#0d1117] rounded-lg border border-[#30363d] p-1">
                  <button onClick={() => setChartMode('total')} className={`px-3 py-1 text-sm rounded-md transition-colors ${chartMode === 'total' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:text-white'}`}>
                    Visão Geral
                  </button>
                  <button onClick={() => setChartMode('specific')} className={`px-3 py-1 text-sm rounded-md transition-colors ${chartMode === 'specific' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:text-white'}`}>
                    Por Meta
                  </button>
                </div>
                {chartMode === 'specific' && (
                  <select 
                    value={selectedGoalChartId ?? goals[0]?.id ?? ''} 
                    onChange={(e) => setSelectedGoalChartId(Number(e.target.value))} 
                    className="bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg px-2 py-1 outline-none"
                  >
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid stroke="#30363d" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px' }}
                    itemStyle={{ color: '#e6edf3' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  />
                  {chartMode === 'total' ? (
                    <>
                      <Line name="Pool Investida" type="monotone" dataKey="pool" stroke="#58a6ff" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                      <Line name="Metas Acumuladas" type="monotone" dataKey="metas" stroke="#3fb950" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                    </>
                  ) : (
                    <>
                      <Line name="Valor Acumulado" type="monotone" dataKey="acumulado" stroke={goals.find(g => g.id === (selectedGoalChartId ?? goals[0]?.id))?.color || "#58a6ff"} strokeWidth={3} dot={{ r: 4 }} />
                      <Line name="Alocação da Pool" type="monotone" dataKey="alocado" stroke="#8b949e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-[#f59e0b]" />
              <h2 className="text-[#e6edf3] font-semibold">Alertas e insights</h2>
            </div>
            <div className="space-y-3">
              {alerts.length === 0 && <p className="text-[#8b949e] text-sm">Nenhum alerta no momento.</p>}
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3 text-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#e6edf3] font-medium">{alert.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${alert.type === 'warning' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20' : alert.type === 'success' ? 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/20' : 'bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20'}`}>
                      {alert.type === 'warning' ? 'Atenção' : alert.type === 'success' ? 'Concluída' : 'Em andamento'}
                    </span>
                  </div>
                  <p className="text-[#8b949e]">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}