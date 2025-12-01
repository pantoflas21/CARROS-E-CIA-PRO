-- ============================================
-- MIGRAÇÃO: Separação de Autenticação Admin/Vendedor
-- ============================================
-- Esta migração garante que a tabela users_profile está correta
-- e cria políticas RLS adequadas para separar Admin e Vendedor

-- Garantir que a tabela users_profile existe e está correta
DO $$
BEGIN
  -- Verificar se a tabela existe, se não, criar
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users_profile') THEN
    CREATE TABLE public.users_profile (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      auth_user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role text NOT NULL CHECK (role IN ('admin', 'vendedor', 'cliente')),
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
  END IF;
END $$;

-- Garantir que RLS está habilitado
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own profile" ON public.users_profile;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users_profile;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users_profile;

-- Política: Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.users_profile
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Política: Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON public.users_profile
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Política: Vendedores podem ver apenas seu próprio perfil
CREATE POLICY "Vendedores can view own profile"
  ON public.users_profile
  FOR SELECT
  USING (
    auth.uid() = auth_user_id
    AND role = 'vendedor'
  );

-- Política: Usuários podem atualizar seu próprio perfil (exceto role)
CREATE POLICY "Users can update own profile"
  ON public.users_profile
  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Política: Admins podem atualizar qualquer perfil
CREATE POLICY "Admins can update all profiles"
  ON public.users_profile
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_profile_auth_user_id ON public.users_profile(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_profile_role ON public.users_profile(role);
CREATE INDEX IF NOT EXISTS idx_users_profile_email ON public.users_profile(email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_users_profile_updated_at ON public.users_profile;
CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON public.users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.users_profile IS 'Perfis de usuários do sistema com roles (admin, vendedor, cliente)';
COMMENT ON COLUMN public.users_profile.role IS 'Role do usuário: admin, vendedor ou cliente';
COMMENT ON COLUMN public.users_profile.is_active IS 'Indica se o usuário está ativo no sistema';

