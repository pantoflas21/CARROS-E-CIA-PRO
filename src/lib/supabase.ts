import { createClient } from '@supabase/supabase-js';

// Validação de variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente para uso no servidor (com validação)
// Se as variáveis não estiverem configuradas, cria um cliente com valores vazios
// que retornará erros, mas não quebrará a aplicação
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-client-info': 'kinito-app',
      },
    },
  }
);

// Cliente para uso no browser (com SSR)
// Nota: Para usar SSR completo, instale @supabase/ssr e use createBrowserClient
export function createClientBrowser() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local');
  }
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }
  );
}

// Função auxiliar para verificar se o Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');
}

export type Database = {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string;
          auth_user_id: string;
          role: 'admin' | 'vendedor' | 'cliente';
          full_name: string;
          email: string;
          phone: string | null;
          cpf: string | null;
          birth_date: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          commission_percentage: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          brand: string;
          model: string;
          year: number;
          color: string;
          fuel_type: string;
          transmission: string;
          mileage: number;
          price: number;
          status: string;
          license_plate: string | null;
          vehicle_type: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
      };
      clients: {
        Row: {
          id: string;
          cpf: string;
          full_name: string;
          email: string;
          phone: string;
          birth_date: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          nationality: string | null;
          profession: string | null;
          marital_status: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          client_id: string;
          vehicle_id: string;
          seller_id: string;
          contract_number: string;
          contract_date: string;
          total_amount: number;
          down_payment: number;
          remaining_amount: number;
          num_installments: number;
          installment_value: number;
          first_installment_date: string;
          contract_pdf_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      installments: {
        Row: {
          id: string;
          contract_id: string;
          installment_number: number;
          due_date: string;
          amount: number;
          status: string;
          boleto_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      payment_history: {
        Row: {
          id: string;
          installment_id: string;
          payment_date: string;
          amount_paid: number;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
        };
      };
    };
  };
};
