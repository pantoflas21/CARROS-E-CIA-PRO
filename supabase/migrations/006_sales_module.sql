-- ============================================
-- MÓDULO DE VENDAS - Estrutura Completa
-- ============================================
-- Esta migração cria as tabelas necessárias para o módulo de vendas

-- ============================================
-- TABELA CLIENTS (Atualizar se necessário)
-- ============================================
-- Verificar se a tabela já existe e tem os campos necessários
DO $$
BEGIN
  -- Se a tabela não existe, criar
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    CREATE TABLE public.clients (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      nome text NOT NULL,
      cpf text UNIQUE NOT NULL,
      telefone text NOT NULL,
      email text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  ELSE
    -- Se existe, garantir que tem os campos necessários
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'nome') THEN
      ALTER TABLE public.clients ADD COLUMN nome text;
      UPDATE public.clients SET nome = COALESCE(full_name, 'Cliente sem nome') WHERE nome IS NULL;
      ALTER TABLE public.clients ALTER COLUMN nome SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Criar índice para CPF
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON public.clients(cpf);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- ============================================
-- TABELA VEHICLES (Atualizar se necessário)
-- ============================================
DO $$
BEGIN
  -- Se a tabela não existe, criar
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vehicles') THEN
    CREATE TABLE public.vehicles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      marca text NOT NULL,
      modelo text NOT NULL,
      ano integer NOT NULL,
      placa text UNIQUE,
      valor numeric(10,2) NOT NULL,
      status text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'vendido')),
      created_at timestamptz DEFAULT now(),
      created_by uuid REFERENCES auth.users(id)
    );
  ELSE
    -- Se existe, garantir que tem os campos necessários
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'marca') THEN
      ALTER TABLE public.vehicles ADD COLUMN marca text;
      UPDATE public.vehicles SET marca = COALESCE(brand, 'Sem marca') WHERE marca IS NULL;
      ALTER TABLE public.vehicles ALTER COLUMN marca SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'modelo') THEN
      ALTER TABLE public.vehicles ADD COLUMN modelo text;
      UPDATE public.vehicles SET modelo = COALESCE(model, 'Sem modelo') WHERE modelo IS NULL;
      ALTER TABLE public.vehicles ALTER COLUMN modelo SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'placa') THEN
      ALTER TABLE public.vehicles ADD COLUMN placa text;
      UPDATE public.vehicles SET placa = license_plate WHERE placa IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'valor') THEN
      ALTER TABLE public.vehicles ADD COLUMN valor numeric(10,2);
      UPDATE public.vehicles SET valor = COALESCE(price, 0) WHERE valor IS NULL;
      ALTER TABLE public.vehicles ALTER COLUMN valor SET NOT NULL;
    END IF;
    
    -- Atualizar status se necessário
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'status') THEN
      UPDATE public.vehicles SET status = 'disponivel' WHERE status NOT IN ('disponivel', 'vendido');
    END IF;
  END IF;
END $$;

-- Criar índice para status e placa
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_placa ON public.vehicles(placa);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_by ON public.vehicles(created_by);

-- ============================================
-- TABELA SALES (Nova)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  vendedor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  valor_venda numeric(10,2) NOT NULL,
  comissao numeric(10,2) NOT NULL,
  comissao_percentual numeric(5,2) NOT NULL DEFAULT 5.00,
  status text NOT NULL DEFAULT 'em negociacao' CHECK (status IN ('em negociacao', 'vendido', 'cancelado')),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON public.sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_vehicle_id ON public.sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_sales_vendedor_id ON public.sales(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);

-- ============================================
-- HABILITAR RLS
-- ============================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS - CLIENTS
-- ============================================
-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Vendedores can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Vendedores can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update clients" ON public.clients;
DROP POLICY IF EXISTS "Vendedores can update clients" ON public.clients;

-- Admins podem ver todos os clientes
CREATE POLICY "Admins can view all clients"
  ON public.clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Vendedores podem ver todos os clientes (para fazer vendas)
CREATE POLICY "Vendedores can view all clients"
  ON public.clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'vendedor')
      AND is_active = true
    )
  );

-- Admins podem inserir clientes
CREATE POLICY "Admins can insert clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Vendedores podem inserir clientes
CREATE POLICY "Vendedores can insert clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'vendedor')
      AND is_active = true
    )
  );

-- Admins podem atualizar clientes
CREATE POLICY "Admins can update clients"
  ON public.clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Vendedores podem atualizar clientes
CREATE POLICY "Vendedores can update clients"
  ON public.clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'vendedor')
      AND is_active = true
    )
  );

-- ============================================
-- POLÍTICAS RLS - VEHICLES
-- ============================================
-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can view all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Vendedores can view all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can insert vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Vendedores can insert vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Vendedores can update vehicles" ON public.vehicles;

-- Admins podem ver todos os veículos
CREATE POLICY "Admins can view all vehicles"
  ON public.vehicles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Vendedores podem ver todos os veículos disponíveis
CREATE POLICY "Vendedores can view all vehicles"
  ON public.vehicles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'vendedor')
      AND is_active = true
    )
  );

-- Admins podem inserir veículos
CREATE POLICY "Admins can insert vehicles"
  ON public.vehicles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Vendedores podem inserir veículos
CREATE POLICY "Vendedores can insert vehicles"
  ON public.vehicles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'vendedor')
      AND is_active = true
    )
  );

-- Admins podem atualizar veículos
CREATE POLICY "Admins can update vehicles"
  ON public.vehicles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Vendedores podem atualizar veículos (apenas os que criaram)
CREATE POLICY "Vendedores can update own vehicles"
  ON public.vehicles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'vendedor')
      AND is_active = true
    )
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
    ))
  );

-- ============================================
-- POLÍTICAS RLS - SALES
-- ============================================
-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can view all sales" ON public.sales;
DROP POLICY IF EXISTS "Vendedores can view own sales" ON public.sales;
DROP POLICY IF EXISTS "Admins can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Vendedores can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Admins can update sales" ON public.sales;
DROP POLICY IF EXISTS "Vendedores can update own sales" ON public.sales;

-- Admins podem ver todas as vendas
CREATE POLICY "Admins can view all sales"
  ON public.sales
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Vendedores podem ver apenas suas próprias vendas
CREATE POLICY "Vendedores can view own sales"
  ON public.sales
  FOR SELECT
  USING (
    vendedor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'vendedor')
      AND is_active = true
    )
  );

-- Admins podem inserir vendas
CREATE POLICY "Admins can insert sales"
  ON public.sales
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Vendedores podem inserir vendas (apenas para si mesmos)
CREATE POLICY "Vendedores can insert sales"
  ON public.sales
  FOR INSERT
  WITH CHECK (
    vendedor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'vendedor')
      AND is_active = true
    )
  );

-- Admins podem atualizar vendas
CREATE POLICY "Admins can update sales"
  ON public.sales
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Vendedores podem atualizar apenas suas próprias vendas
CREATE POLICY "Vendedores can update own sales"
  ON public.sales
  FOR UPDATE
  USING (
    vendedor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'vendedor')
      AND is_active = true
    )
  );

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para sales
DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar status do veículo quando vendido
CREATE OR REPLACE FUNCTION update_vehicle_status_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma venda é marcada como 'vendido', atualizar o veículo
  IF NEW.status = 'vendido' AND (OLD.status IS NULL OR OLD.status != 'vendido') THEN
    UPDATE public.vehicles
    SET status = 'vendido'
    WHERE id = NEW.vehicle_id;
  END IF;
  
  -- Se a venda for cancelada e o veículo estava vendido, voltar para disponível
  IF NEW.status = 'cancelado' AND OLD.status = 'vendido' THEN
    UPDATE public.vehicles
    SET status = 'disponivel'
    WHERE id = NEW.vehicle_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar status do veículo
DROP TRIGGER IF EXISTS trigger_update_vehicle_status ON public.sales;
CREATE TRIGGER trigger_update_vehicle_status
  AFTER INSERT OR UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_status_on_sale();

-- Função para calcular comissão automaticamente
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
DECLARE
  commission_percent numeric(5,2);
BEGIN
  -- Buscar percentual de comissão do vendedor
  SELECT COALESCE(commission_percentage, 5.00) INTO commission_percent
  FROM public.users_profile
  WHERE auth_user_id = NEW.vendedor_id;
  
  -- Se não encontrar, usar 5% padrão
  IF commission_percent IS NULL THEN
    commission_percent := 5.00;
  END IF;
  
  -- Calcular comissão
  NEW.comissao_percentual := commission_percent;
  NEW.comissao := (NEW.valor_venda * commission_percent) / 100;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular comissão
DROP TRIGGER IF EXISTS trigger_calculate_commission ON public.sales;
CREATE TRIGGER trigger_calculate_commission
  BEFORE INSERT OR UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION calculate_commission();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE public.clients IS 'Clientes do sistema';
COMMENT ON TABLE public.vehicles IS 'Veículos disponíveis para venda';
COMMENT ON TABLE public.sales IS 'Vendas realizadas';
COMMENT ON COLUMN public.sales.comissao_percentual IS 'Percentual de comissão aplicado';
COMMENT ON COLUMN public.sales.comissao IS 'Valor da comissão calculado automaticamente';

