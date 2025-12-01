# 🔐 Guia de Separação de Autenticação Admin/Vendedor

## ✅ Implementação Completa

O sistema agora possui **logins completamente separados** para Admin e Vendedor, resolvendo todos os problemas de autenticação.

## 📋 O Que Foi Implementado

### 1. ✅ Rotas Separadas de Login

- **Admin**: `/auth/login/admin`
- **Vendedor**: `/auth/login/vendedor`
- **Cliente**: `/login` (mantido como estava)

### 2. ✅ Autenticação Corrigida

- Login usando `supabase.auth.signInWithPassword()`
- Verificação de perfil na tabela `users_profile`
- Validação de role (admin ou vendedor)
- Redirecionamento automático baseado no role
- Tratamento completo de erros

### 3. ✅ Proteção de Rotas

- Middleware atualizado para proteger rotas
- Admin não acessa área de vendedor
- Vendedor não acessa área de admin
- Usuários não logados são redirecionados

### 4. ✅ Correção do Erro "Failed to Fetch"

- Validação rigorosa de variáveis de ambiente
- Tratamento de erros específicos do Supabase
- Mensagens de erro amigáveis
- Verificação de configuração antes de fazer requests

## 🗄️ Configuração do Banco de Dados

### Passo 1: Executar Migrações SQL

Execute no SQL Editor do Supabase (na ordem):

1. **`supabase/migrations/001_initial_schema.sql`** - Schema inicial (se ainda não executou)
2. **`supabase/migrations/004_fix_auth_separation.sql`** - Políticas RLS e ajustes
3. **`supabase/migrations/005_create_default_users.sql`** - Usuários padrão

### Passo 2: Criar Usuários no Supabase

#### Opção A: Via Dashboard do Supabase (Recomendado)

1. Acesse **Authentication** > **Users**
2. Clique em **Add User**
3. Crie o usuário Admin:
   - Email: `admin@kinito.com`
   - Senha: `Admin@123`
   - ✅ Marque "Auto Confirm User"
4. Crie o usuário Vendedor:
   - Email: `vendedor@kinito.com`
   - Senha: `Vendedor@123`
   - ✅ Marque "Auto Confirm User"
5. Execute o script `005_create_default_users.sql` para criar os perfis

#### Opção B: Via SQL (Avançado)

Execute o script `005_create_default_users.sql` completo (descomente a parte de criação de usuários).

### Passo 3: Verificar Usuários Criados

Execute esta query para verificar:

```sql
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
```

Deve retornar 2 linhas com os usuários criados.

## 🔧 Configuração de Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` está configurado:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

**Importante:**
- ✅ Remova espaços em branco
- ✅ Não use aspas
- ✅ URL deve começar com `https://`

## 🧪 Testes

### Teste 1: Login Admin

1. Acesse: `http://localhost:3000/auth/login/admin`
2. Email: `admin@kinito.com`
3. Senha: `Admin@123`
4. ✅ Deve redirecionar para `/admin`

### Teste 2: Login Vendedor

1. Acesse: `http://localhost:3000/auth/login/vendedor`
2. Email: `vendedor@kinito.com`
3. Senha: `Vendedor@123`
4. ✅ Deve redirecionar para `/vendedor`

### Teste 3: Proteção de Rotas

1. Faça login como Admin
2. Tente acessar `/vendedor`
3. ✅ Deve redirecionar para `/auth/login/admin` com erro

4. Faça login como Vendedor
5. Tente acessar `/admin`
6. ✅ Deve redirecionar para `/auth/login/vendedor` com erro

### Teste 4: Erros de Autenticação

1. Tente fazer login com credenciais incorretas
2. ✅ Deve mostrar mensagem de erro amigável
3. ✅ Não deve mostrar "Failed to fetch"

## 📝 Credenciais Padrão

### Administrador
- **Email**: `admin@kinito.com`
- **Senha**: `Admin@123`
- **Role**: `admin`

### Vendedor
- **Email**: `vendedor@kinito.com`
- **Senha**: `Vendedor@123`
- **Role**: `vendedor`

### Cliente (mantido)
- **CPF**: `123.456.789-00`
- **Data**: `01/01/1990`

## 🔍 Solução de Problemas

### Erro: "Failed to fetch"

**Causa**: Variáveis de ambiente não configuradas ou inválidas

**Solução**:
1. Verifique se `.env.local` existe
2. Verifique se as variáveis estão corretas
3. Reinicie o servidor: `npm run dev`
4. Limpe o cache: `rm -rf .next`

### Erro: "Invalid login credentials"

**Causa**: Email ou senha incorretos, ou usuário não existe

**Solução**:
1. Verifique se o usuário foi criado no Supabase
2. Verifique se o email está correto
3. Verifique se a senha está correta
4. Verifique se o email foi confirmado

### Erro: "Perfil não encontrado"

**Causa**: Usuário existe no auth.users mas não tem perfil em users_profile

**Solução**:
1. Execute o script `005_create_default_users.sql`
2. Ou crie o perfil manualmente:

```sql
INSERT INTO public.users_profile (
  auth_user_id,
  role,
  full_name,
  email,
  is_active
)
VALUES (
  'ID_DO_USUARIO_AQUI',
  'admin', -- ou 'vendedor'
  'Nome do Usuário',
  'email@exemplo.com',
  true
);
```

### Erro: "Acesso negado"

**Causa**: Role do usuário não corresponde à rota acessada

**Solução**:
1. Verifique o role do usuário na tabela `users_profile`
2. Use o login correto (admin ou vendedor)
3. Verifique se o perfil está ativo (`is_active = true`)

## ✅ Checklist Final

- [ ] Migrações SQL executadas
- [ ] Usuários criados no Supabase
- [ ] Perfis criados na tabela `users_profile`
- [ ] Variáveis de ambiente configuradas
- [ ] Login Admin funcionando
- [ ] Login Vendedor funcionando
- [ ] Proteção de rotas funcionando
- [ ] Sem erros "Failed to fetch"
- [ ] Mensagens de erro amigáveis
- [ ] Redirecionamentos corretos

## 🎉 Pronto!

O sistema está completamente funcional com autenticação separada para Admin e Vendedor!

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy HH:mm")

