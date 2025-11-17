-- Initial Schema for Seminovo Dealership

-- Create user_role type
CREATE TYPE public.user_role AS ENUM ('admin', 'vendedor', 'cliente');

-- Users Profile Table
CREATE TABLE public.users_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'cliente',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  cpf text UNIQUE,
  birth_date date,
  address text,
  city text,
  state text,
  zip_code text,
  commission_percentage numeric(5,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles Table
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  color text NOT NULL,
  fuel_type text DEFAULT 'Gasolina',
  transmission text DEFAULT 'Automático',
  mileage integer NOT NULL,
  price numeric(10,2) NOT NULL,
  status text DEFAULT 'available',
  license_plate text UNIQUE,
  vehicle_type text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicle Images Table
CREATE TABLE public.vehicle_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Clients Table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  birth_date date,
  address text,
  city text,
  state text,
  zip_code text,
  nationality text,
  profession text,
  marital_status text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contracts Table
CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id),
  seller_id uuid NOT NULL REFERENCES auth.users(id),
  contract_number text UNIQUE NOT NULL,
  contract_date date NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  down_payment numeric(10,2) DEFAULT 0,
  remaining_amount numeric(10,2) NOT NULL,
  num_installments integer NOT NULL,
  installment_value numeric(10,2) NOT NULL,
  first_installment_date date NOT NULL,
  contract_pdf_url text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Installments Table
CREATE TABLE public.installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id),
  installment_number integer NOT NULL,
  due_date date NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text DEFAULT 'open',
  boleto_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment History Table
CREATE TABLE public.payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installment_id uuid NOT NULL REFERENCES public.installments(id),
  payment_date date NOT NULL,
  amount_paid numeric(10,2) NOT NULL,
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Seller Vehicles Table
CREATE TABLE public.seller_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id),
  assigned_at timestamptz DEFAULT now()
);

-- Activity Logs Table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create Indexes
CREATE INDEX idx_users_profile_auth_user_id ON public.users_profile(auth_user_id);
CREATE INDEX idx_users_profile_role ON public.users_profile(role);
CREATE INDEX idx_users_profile_cpf ON public.users_profile(cpf);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_created_by ON public.vehicles(created_by);
CREATE INDEX idx_clients_cpf ON public.clients(cpf);
CREATE INDEX idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX idx_contracts_vehicle_id ON public.contracts(vehicle_id);
CREATE INDEX idx_contracts_seller_id ON public.contracts(seller_id);
CREATE INDEX idx_installments_contract_id ON public.installments(contract_id);
CREATE INDEX idx_installments_status ON public.installments(status);
CREATE INDEX idx_payment_history_installment_id ON public.payment_history(installment_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
