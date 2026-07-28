// ============================================================================
// GOAL TYPES (METAS & CATEGORIAS)
// ============================================================================

export interface Goal {
  id: number;
  title: string;
  target_amount: number;
  external_aporte: number;
  percent_allocation: number;
  color: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Tipo utilizado para a criação de uma nova meta.
 * Omitimos 'id', 'created_at' e 'updated_at' pois são gerados automaticamente pelo banco de dados.
 */
export type CreateGoalDTO = Omit<Goal, 'id' | 'created_at' | 'updated_at'>;

/**
 * Tipo utilizado para a atualização de uma meta existente.
 * Partial torna todas as propriedades de CreateGoalDTO opcionais, 
 * permitindo atualizar apenas um campo (como o external_aporte) sem enviar o objeto inteiro.
 */
export type UpdateGoalDTO = Partial<CreateGoalDTO>;