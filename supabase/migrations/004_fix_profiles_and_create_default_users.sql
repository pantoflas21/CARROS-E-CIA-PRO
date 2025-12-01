-- ============================================
-- MIGRAÇÃO 004: Corrigir tabela profiles e criar usuários padrão
-- ============================================

-- Garantir que a extensão pgcrypto está instalada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verificar se a tabela users_profile existe e está correta
-- Se não existir, criar
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users_profile') THEN
    -- Criar tipo ENUM se não existir
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'vendedor', 'cliente');
      END IF;
    END $$;

    -- Criar tabela users_profile
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

    -- Criar índices
    CREATE INDEX idx_users_profile_auth_user_id ON public.users_profile(auth_user_id);
    CREATE INDEX idx_users_profile_role ON public.users_profile(role);
    CREATE INDEX idx_users_profile_email ON public.users_profile(email);

    -- Habilitar RLS
    ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

    -- Criar políticas RLS
    -- Usuários podem ver apenas seu próprio perfil
    CREATE POLICY "Users can view own profile"
      ON public.users_profile FOR SELECT
      USING (auth.uid() = auth_user_id);

    -- Admins podem ver todos os perfis
    CREATE POLICY "Admins can view all profiles"
      ON public.users_profile FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.users_profile
          WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
      );

    -- Usuários podem atualizar apenas seu próprio perfil
    CREATE POLICY "Users can update own profile"
      ON public.users_profile FOR UPDATE
      USING (auth.uid() = auth_user_id);

    -- Admins podem atualizar qualquer perfil
    CREATE POLICY "Admins can update all profiles"
      ON public.users_profile FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.users_profile
          WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================
-- CRIAR USUÁRIO ADMIN PADRÃO
-- ============================================
DO $$
DECLARE
  admin_user_id uuid;
  admin_exists boolean;
BEGIN
  -- Verificar se o usuário admin já existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@kinito.com') INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Criar usuário no auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@kinito.com',
      crypt('Admin@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now()
    )
    RETURNING id INTO admin_user_id;

    -- Criar perfil do admin
    INSERT INTO public.users_profile (
      auth_user_id,
      role,
      full_name,
      email,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id,
      'admin',
      'Administrador Kinito',
      'admin@kinito.com',
      true,
      now(),
      now()
    )
    ON CONFLICT (auth_user_id) DO NOTHING;

    RAISE NOTICE 'Usuário admin criado com ID: %', admin_user_id;
  ELSE
    -- Se já existe, atualizar o perfil para garantir que é admin
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@kinito.com';
    
    UPDATE public.users_profile
    SET role = 'admin', is_active = true, updated_at = now()
    WHERE auth_user_id = admin_user_id;
    
    -- Se não existe perfil, criar
    IF NOT EXISTS (SELECT 1 FROM public.users_profile WHERE auth_user_id = admin_user_id) THEN
      INSERT INTO public.users_profile (
        auth_user_id,
        role,
        full_name,
        email,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        admin_user_id,
        'admin',
        'Administrador Kinito',
        'admin@kinito.com',
        true,
        now(),
        now()
      );
    END IF;
    
    RAISE NOTICE 'Usuário admin já existe, perfil atualizado.';
  END IF;
END $$;

-- ============================================
-- CRIAR USUÁRIO VENDEDOR PADRÃO
-- ============================================
DO $$
DECLARE
  vendedor_user_id uuid;
  vendedor_exists boolean;
BEGIN
  -- Verificar se o usuário vendedor já existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'vendedor@kinito.com') INTO vendedor_exists;
  
  IF NOT vendedor_exists THEN
    -- Criar usuário no auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'vendedor@kinito.com',
      crypt('Vendedor@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now()
    )
    RETURNING id INTO vendedor_user_id;

    -- Criar perfil do vendedor
    INSERT INTO public.users_profile (
      auth_user_id,
      role,
      full_name,
      email,
      commission_percentage,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      vendedor_user_id,
      'vendedor',
      'Vendedor Kinito',
      'vendedor@kinito.com',
      5.00,
      true,
      now(),
      now()
    )
    ON CONFLICT (auth_user_id) DO NOTHING;

    RAISE NOTICE 'Usuário vendedor criado com ID: %', vendedor_user_id;
  ELSE
    -- Se já existe, atualizar o perfil para garantir que é vendedor
    SELECT id INTO vendedor_user_id FROM auth.users WHERE email = 'vendedor@kinito.com';
    
    UPDATE public.users_profile
    SET role = 'vendedor', is_active = true, updated_at = now()
    WHERE auth_user_id = vendedor_user_id;
    
    -- Se não existe perfil, criar
    IF NOT EXISTS (SELECT 1 FROM public.users_profile WHERE auth_user_id = vendedor_user_id) THEN
      INSERT INTO public.users_profile (
        auth_user_id,
        role,
        full_name,
        email,
        commission_percentage,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        vendedor_user_id,
        'vendedor',
        'Vendedor Kinito',
        'vendedor@kinito.com',
        5.00,
        true,
        now(),
        now()
      );
    END IF;
    
    RAISE NOTICE 'Usuário vendedor já existe, perfil atualizado.';
  END IF;
END $$;

-- ============================================
-- VERIFICAR USUÁRIOS CRIADOS
-- ============================================
SELECT 
  u.email,
  up.role,
  up.full_name,
  up.is_active,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
LEFT JOIN public.users_profile up ON u.id = up.auth_user_id
WHERE u.email IN ('admin@kinito.com', 'vendedor@kinito.com')
ORDER BY up.role;

