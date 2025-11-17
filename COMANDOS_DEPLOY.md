# 🚀 COMANDOS PARA DEPLOY - Sistema Seminovo

## 📋 PASSO A PASSO COMPLETO

### ⚠️ IMPORTANTE: Execute os comandos na ordem apresentada!

---

## 1️⃣ PREPARAR O PROJETO LOCALMENTE

```bash
# Navegar para a pasta do projeto
cd "C:\Users\Claiton\Desktop\carros e cia\project"

# Instalar dependências
npm install

# Verificar se não há erros
npm run lint
```

---

## 2️⃣ CONFIGURAR SUPABASE

### 2.1 Criar Projeto no Supabase

1. Acesse: https://supabase.com
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: seminovo (ou o nome que preferir)
   - **Database Password**: Anote esta senha!
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
5. Clique em **"Create new project"**
6. Aguarde a criação (pode levar alguns minutos)

### 2.2 Obter Credenciais

1. No projeto criado, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (chave longa)

### 2.3 Executar Migrações SQL

1. No Supabase Dashboard, clique em **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo: `supabase/migrations/001_initial_schema.sql`
4. Copie TODO o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** (ou F5)
7. Aguarde a confirmação de sucesso

### 2.4 (Opcional) Dados de Teste

1. Se quiser dados de teste, abra: `supabase/migrations/002_seed_demo_data.sql`
2. Copie e execute no SQL Editor

---

## 3️⃣ CRIAR REPOSITÓRIO NO GITHUB

### 3.1 Criar Repositório

1. Acesse: https://github.com
2. Clique no **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha:
   - **Repository name**: seminovo (ou outro nome)
   - **Description**: Sistema de gestão de vendas
   - Marque como **Private** (recomendado)
5. Clique em **"Create repository"**

### 3.2 Inicializar Git e Fazer Push

```bash
# Ainda na pasta do projeto
cd "C:\Users\Claiton\Desktop\carros e cia\project"

# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit - Sistema Seminovo pronto para deploy"

# Adicionar repositório remoto (SUBSTITUA SEU_USUARIO e SEU_REPO)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

**⚠️ IMPORTANTE**: Substitua `SEU_USUARIO` e `SEU_REPO` pelos seus dados reais!

---

## 4️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL

### 4.1 Criar Conta/Projeto no Vercel

1. Acesse: https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New..."** > **"Project"**
4. Selecione o repositório que você acabou de criar
5. Clique em **"Import"**

### 4.2 Configurar Variáveis de Ambiente

**ANTES de clicar em "Deploy"**, configure as variáveis:

1. Na seção **"Environment Variables"**, clique em **"Add"**
2. Adicione a primeira variável:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Cole a URL do Supabase (ex: `https://xxxxx.supabase.co`)
   - Marque todas as opções (Production, Preview, Development)
   - Clique em **"Save"**

3. Adicione a segunda variável:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Cole a chave anon do Supabase
   - Marque todas as opções
   - Clique em **"Save"**

### 4.3 Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (pode levar 2-5 minutos)
3. Quando terminar, você verá uma URL tipo: `https://seu-projeto.vercel.app`

---

## 5️⃣ TESTAR O DEPLOY

### 5.1 Acessar o Site

1. Abra a URL fornecida pelo Vercel
2. Você deve ver a tela de login

### 5.2 Testar Login Admin/Vendedor

1. Clique em **"Administrador / Vendedor"**
2. Se você criou dados de teste:
   - Email: `admin@seminovo.com`
   - Senha: `senha123`
3. Se não, você precisa criar um usuário (veja próximo passo)

### 5.3 Criar Usuário Admin (se necessário)

No Supabase SQL Editor, execute:

```sql
-- 1. Criar usuário de autenticação
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'admin@seminovo.com',
  crypt('senha123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- 2. Pegar o ID do usuário criado
SELECT id FROM auth.users WHERE email = 'admin@seminovo.com';

-- 3. Criar perfil (SUBSTITUA O UUID pelo ID retornado acima)
INSERT INTO users_profile (auth_user_id, role, full_name, email, is_active)
VALUES (
  'UUID_AQUI',  -- Cole o UUID do passo anterior
  'admin',
  'Administrador',
  'admin@seminovo.com',
  true
);
```

---

## 6️⃣ COMANDOS RÁPIDOS (RESUMO)

```bash
# 1. Ir para a pasta do projeto
cd "C:\Users\Claiton\Desktop\carros e cia\project"

# 2. Instalar dependências
npm install

# 3. Testar build localmente
npm run build

# 4. Inicializar git (se necessário)
git init

# 5. Adicionar arquivos
git add .

# 6. Commit
git commit -m "Deploy inicial"

# 7. Adicionar remote (SUBSTITUA pelos seus dados)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git

# 8. Push
git push -u origin main
```

Depois, configure as variáveis no Vercel e faça o deploy!

---

## ✅ CHECKLIST FINAL

- [ ] Projeto criado no Supabase
- [ ] Migrações SQL executadas
- [ ] Credenciais do Supabase anotadas
- [ ] Repositório criado no GitHub
- [ ] Código enviado para GitHub
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy realizado com sucesso
- [ ] Site acessível e funcionando
- [ ] Login testado

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Variáveis de ambiente não configuradas"
- Verifique se adicionou as variáveis no Vercel
- Certifique-se que os nomes estão corretos: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Erro: "Acesso negado"
- Verifique se executou as migrações SQL
- Verifique se criou o usuário admin corretamente

### Build falha no Vercel
- Verifique os logs no Vercel (Deployments > View Function Logs)
- Certifique-se que todas as dependências estão no package.json

### Site não carrega
- Verifique se as variáveis de ambiente estão configuradas
- Verifique os logs do Vercel
- Teste o build localmente primeiro: `npm run build`

---

## 📞 PRÓXIMOS PASSOS

Após o deploy bem-sucedido:

1. Configure RLS (Row Level Security) no Supabase (veja README_SECURITY.md)
2. Crie usuários de teste
3. Configure domínio personalizado (opcional)
4. Configure monitoramento (opcional)

---

**🎉 Parabéns! Seu sistema está no ar!**

