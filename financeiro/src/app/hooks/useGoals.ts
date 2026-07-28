import useSWR from 'swr';
import { api } from '@/app/lib/utils/api';
import { Goal, CreateGoalDTO, UpdateGoalDTO } from '@/app/types/api';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useGoals() {
  const { data, error, mutate, isLoading } = useSWR<Goal[]>('/api/goals', fetcher);
  
  // NOVA LINHA: Busca o histórico do banco de dados
  const { data: historyData } = useSWR<any[]>('/api/goals/history', fetcher);

  const addGoal = async (goal: CreateGoalDTO) => {
    const response = await api.post('/api/goals', goal);
    await mutate([...(data || []), response.data], false); 
    mutate(); 
  };

  const editGoal = async (id: number, updates: UpdateGoalDTO) => {
    const response = await api.put('/api/goals', { id, ...updates });
    await mutate(data?.map(g => g.id === id ? response.data : g), false);
    mutate();
  };

  const removeGoal = async (id: number) => {
    await api.delete(`/api/goals?id=${id}`);
    await mutate(data?.filter(g => g.id !== id), false);
    mutate();
  };

  return {
    goals: data || [],
    historyData: historyData || [], // NOVA LINHA: Expondo os dados para a página
    isLoading,
    isError: error,
    addGoal,
    editGoal,
    removeGoal,
  };
}