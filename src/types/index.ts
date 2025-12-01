export type UserRole = 'admin' | 'vendedor' | 'cliente';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  commission_percentage?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuel_type: string;
  transmission: string;
  mileage: number;
  price: number;
  status: 'available' | 'sold' | 'maintenance';
  license_plate?: string;
  vehicle_type: 'carro' | 'moto';
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  cpf: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  nationality?: string;
  profession?: string;
  marital_status?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contract {
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
  contract_pdf_url?: string;
  status: 'active' | 'completed' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface Installment {
  id: string;
  contract_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  status: 'open' | 'paid' | 'overdue';
  boleto_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  installment_id: string;
  payment_date: string;
  amount_paid: number;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

// ============================================
// MÓDULO DE VENDAS
// ============================================

export interface SaleClient {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  created_at: string;
}

export interface SaleVehicle {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa?: string;
  valor: number;
  status: 'disponivel' | 'vendido';
  created_at: string;
  created_by?: string;
}

export interface Sale {
  id: string;
  client_id: string;
  vehicle_id: string;
  vendedor_id: string;
  valor_venda: number;
  comissao: number;
  comissao_percentual: number;
  status: 'em negociacao' | 'vendido' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos (quando buscados com join)
  client?: SaleClient;
  vehicle?: SaleVehicle;
  vendedor?: {
    id: string;
    full_name: string;
    email: string;
  };
}
