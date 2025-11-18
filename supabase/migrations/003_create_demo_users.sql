-- Script para criar usuários de demonstração
-- Execute este script no SQL Editor do Supabase

-- 1. Criar usuário Admin
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Inserir usuário na tabela auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@seminovo.com',
    crypt('senha123', gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
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
    'admin@seminovo.com',
    true,
    now(),
    now()
  );

  RAISE NOTICE 'Usuário admin criado com ID: %', admin_user_id;
END $$;

-- 2. Criar usuário Vendedor
DO $$
DECLARE
  vendedor_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'vendedor@seminovo.com',
    crypt('senha123', gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO vendedor_user_id;

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
    vendedor_user_id,
    'vendedor',
    'Vendedor Kinito',
    'vendedor@seminovo.com',
    true,
    now(),
    now()
  );

  RAISE NOTICE 'Usuário vendedor criado com ID: %', vendedor_user_id;
END $$;

-- 3. Verificar usuários criados
SELECT 
  u.email,
  up.role,
  up.full_name,
  up.is_active
FROM auth.users u
JOIN public.users_profile up ON u.id = up.auth_user_id
WHERE u.email IN ('admin@seminovo.com', 'vendedor@seminovo.com');

