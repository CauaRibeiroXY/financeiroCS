import { supabaseAdmin } from '@/app/lib/supabase/client';
import { Goal, CreateGoalDTO, UpdateGoalDTO } from '@/app/types/api';

export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await supabaseAdmin
    .from('goals')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Erro ao buscar metas: ${error.message}`);
  return data || [];
}

export async function createGoal(goal: CreateGoalDTO): Promise<Goal> {
  const { data, error } = await supabaseAdmin
    .from('goals')
    .insert(goal)
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar meta: ${error.message}`);
  return data;
}

export async function updateGoal(id: number, updates: UpdateGoalDTO): Promise<Goal> {
  const { data, error } = await supabaseAdmin
    .from('goals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar meta: ${error.message}`);
  return data;
}

export async function deleteGoal(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('goals')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Erro ao deletar meta: ${error.message}`);
}

export async function getGoalSnapshots(monthsBack = 6) {
  // Puxa o histórico dos últimos X meses
  const dataLimite = new Date();
  dataLimite.setMonth(dataLimite.getMonth() - monthsBack);

  const { data, error } = await supabaseAdmin
    .from('goal_snapshots')
    .select('*')
    .gte('snapshot_date', dataLimite.toISOString())
    .order('snapshot_date', { ascending: true });

  if (error) throw new Error(`Erro ao buscar histórico: ${error.message}`);
  return data || [];
}