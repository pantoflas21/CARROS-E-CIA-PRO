-- Script para criar usuários de demonstração
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Copie apenas o SQL abaixo, SEM os marcadores ```sql

-- Habilitar extensão pgcrypto (se necessário)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar usuário Admin
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
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
    'admin@seminovo.com',
    crypt('senha123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  )
  RETURNING id INTO admin_user_id;

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

-- Criar usuário Vendedor
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
    'vendedor@seminovo.com',
    crypt('senha123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
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

-- Criar Clientes de Demonstração
INSERT INTO public.clients (
  cpf,
  full_name,
  email,
  phone,
  birth_date,
  address,
  city,
  state,
  zip_code,
  nationality,
  profession,
  marital_status,
  is_active
)
VALUES
  (
    '12345678900',
    'João Silva',
    'joao@email.com',
    '(11) 99999-0001',
    '1990-01-01',
    'Rua A, 123',
    'São Paulo',
    'SP',
    '01234-567',
    'Brasileiro',
    'Engenheiro',
    'Casado',
    true
  ),
  (
    '98765432100',
    'Maria Santos',
    'maria@email.com',
    '(11) 99999-0002',
    '1985-05-15',
    'Avenida B, 456',
    'Rio de Janeiro',
    'RJ',
    '20000-000',
    'Brasileira',
    'Médica',
    'Solteira',
    true
  )
ON CONFLICT (cpf) DO NOTHING;

-- Verificar usuários criados
SELECT 
  u.email,
  up.role,
  up.full_name,
  up.is_active
FROM auth.users u
JOIN public.users_profile up ON u.id = up.auth_user_id
WHERE u.email IN ('admin@seminovo.com', 'vendedor@seminovo.com');

-- Verificar clientes criados
SELECT 
  cpf,
  full_name,
  email,
  birth_date,
  is_active
FROM public.clients
WHERE cpf IN ('12345678900', '98765432100');
