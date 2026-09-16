import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'pluggy-quickstart',
      },
    },
  }
);

// Função helper para obter cliente admin
export const getSupabaseAdmin = () => supabaseAdmin;