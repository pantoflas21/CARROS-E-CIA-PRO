# 🔑 Como Criar Usuários no Supabase

## ⚠️ IMPORTANTE: Execute este script no Supabase SQL Editor

Para fazer login no sistema, você precisa criar os usuários primeiro. Siga estes passos:

### 1️⃣ Acesse o Supabase SQL Editor

1. Vá para https://supabase.com
2. Acesse seu projeto
3. Clique em **SQL Editor** no menu lateral
4. Clique em **New query**

### 2️⃣ Execute o Script de Criação de Usuários

Copie e cole o conteúdo do arquivo `supabase/migrations/003_create_demo_users.sql` no SQL Editor e execute.

**OU** copie e cole este script diretamente:

```sql
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
END $$;
```

### 3️⃣ Verificar Usuários Criados

Execute esta query para verificar:

```sql
SELECT 
  u.email,
  up.role,
  up.full_name,
  up.is_active
FROM auth.users u
JOIN public.users_profile up ON u.id = up.auth_user_id
WHERE u.email IN ('admin@seminovo.com', 'vendedor@seminovo.com');
```

### 4️⃣ Credenciais de Login

Após executar o script, use estas credenciais:

**Admin:**
- Email: `admin@seminovo.com`
- Senha: `senha123`

**Vendedor:**
- Email: `vendedor@seminovo.com`
- Senha: `senha123`

**Cliente:**
- CPF: `123.456.789-00`
- Data de Nascimento: `01/01/1990`

### ⚠️ Problemas Comuns

**Erro: "relation auth.users does not exist"**
- Certifique-se de que executou o script `001_initial_schema.sql` primeiro

**Erro: "function gen_random_uuid() does not exist"**
- Execute: `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`

**Login não funciona após criar usuário**
- Verifique se o perfil foi criado corretamente
- Verifique se `is_active = true`
- Verifique se o email está correto (case-sensitive)

### ✅ Pronto!

Após executar o script, você poderá fazer login no sistema.

