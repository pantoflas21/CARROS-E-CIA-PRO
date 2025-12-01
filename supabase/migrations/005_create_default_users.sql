-- ============================================
-- CRIAÇÃO DE USUÁRIOS PADRÃO
-- ============================================
-- Este script cria os usuários padrão Admin e Vendedor
-- Execute este script APÓS criar os usuários no auth.users

-- IMPORTANTE: Primeiro você precisa criar os usuários no auth.users
-- Use o Supabase Dashboard > Authentication > Add User
-- Ou use a função abaixo (requer permissões de admin do Supabase)

-- ============================================
-- OPÇÃO 1: Criar via Supabase Dashboard
-- ============================================
-- 1. Vá em Authentication > Users
-- 2. Clique em "Add User"
-- 3. Crie:
--    - Email: admin@kinito.com
--    - Senha: Admin@123
--    - Email confirmado: SIM
-- 4. Repita para vendedor@kinito.com / Vendedor@123
-- 5. Depois execute a parte abaixo para criar os perfis

-- ============================================
-- OPÇÃO 2: Criar via SQL (requer permissões)
-- ============================================
-- Descomente e ajuste se tiver permissões de admin do Supabase

/*
-- Criar usuário Admin
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
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
    updated_at,
    confirmation_token,
    recovery_token
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
    now(),
    '',
    ''
  )
  RETURNING id INTO admin_user_id;

  -- Criar perfil
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

  RAISE NOTICE 'Usuário Admin criado com ID: %', admin_user_id;
END $$;

-- Criar usuário Vendedor
DO $$
DECLARE
  vendedor_user_id uuid;
BEGIN
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
    updated_at,
    confirmation_token,
    recovery_token
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
    now(),
    '',
    ''
  )
  RETURNING id INTO vendedor_user_id;

  -- Criar perfil
  INSERT INTO public.users_profile (
    auth_user_id,
    role,
    full_name,
    email,
    is_active,
    commission_percentage,
    created_at,
    updated_at
  )
  VALUES (
    vendedor_user_id,
    'vendedor',
    'Vendedor Kinito',
    'vendedor@kinito.com',
    true,
    5.00,
    now(),
    now()
  );

  RAISE NOTICE 'Usuário Vendedor criado com ID: %', vendedor_user_id;
END $$;
*/

-- ============================================
-- CRIAR PERFIS (Execute após criar usuários no auth.users)
-- ============================================
-- Esta parte cria os perfis baseados nos usuários já existentes no auth.users

-- Criar perfil Admin (se o usuário já existe no auth.users)
DO $$
DECLARE
  admin_user_id uuid;
  profile_exists boolean;
BEGIN
  -- Buscar ID do usuário admin
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@kinito.com'
  LIMIT 1;

  IF admin_user_id IS NOT NULL THEN
    -- Verificar se o perfil já existe
    SELECT EXISTS(
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = admin_user_id
    ) INTO profile_exists;

    IF NOT profile_exists THEN
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
      RAISE NOTICE 'Perfil Admin criado para usuário: %', admin_user_id;
    ELSE
      RAISE NOTICE 'Perfil Admin já existe para usuário: %', admin_user_id;
    END IF;
  ELSE
    RAISE NOTICE 'Usuário admin@kinito.com não encontrado no auth.users. Crie primeiro!';
  END IF;
END $$;

-- Criar perfil Vendedor (se o usuário já existe no auth.users)
DO $$
DECLARE
  vendedor_user_id uuid;
  profile_exists boolean;
BEGIN
  -- Buscar ID do usuário vendedor
  SELECT id INTO vendedor_user_id
  FROM auth.users
  WHERE email = 'vendedor@kinito.com'
  LIMIT 1;

  IF vendedor_user_id IS NOT NULL THEN
    -- Verificar se o perfil já existe
    SELECT EXISTS(
      SELECT 1 FROM public.users_profile
      WHERE auth_user_id = vendedor_user_id
    ) INTO profile_exists;

    IF NOT profile_exists THEN
      INSERT INTO public.users_profile (
        auth_user_id,
        role,
        full_name,
        email,
        is_active,
        commission_percentage,
        created_at,
        updated_at
      )
      VALUES (
        vendedor_user_id,
        'vendedor',
        'Vendedor Kinito',
        'vendedor@kinito.com',
        true,
        5.00,
        now(),
        now()
      );
      RAISE NOTICE 'Perfil Vendedor criado para usuário: %', vendedor_user_id;
    ELSE
      RAISE NOTICE 'Perfil Vendedor já existe para usuário: %', vendedor_user_id;
    END IF;
  ELSE
    RAISE NOTICE 'Usuário vendedor@kinito.com não encontrado no auth.users. Crie primeiro!';
  END IF;
END $$;

-- Verificar usuários criados
SELECT 
  u.email,
  up.role,
  up.full_name,
  up.is_active,
  u.email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users u
LEFT JOIN public.users_profile up ON u.id = up.auth_user_id
WHERE u.email IN ('admin@kinito.com', 'vendedor@kinito.com')
ORDER BY up.role;

