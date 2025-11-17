# 📋 COMANDOS PARA COPIAR E COLAR - Deploy Completo

## ⚡ COMANDOS RÁPIDOS (Copie e cole no PowerShell)

### 1️⃣ PREPARAR O PROJETO

```powershell
# Ir para a pasta do projeto
cd "C:\Users\Claiton\Desktop\carros e cia\project"

# Instalar dependências
npm install

# Verificar se está tudo ok
npm run lint
```

---

### 2️⃣ TESTAR BUILD LOCAL (OPCIONAL mas recomendado)

```powershell
# Testar se o build funciona
npm run build

# Se funcionar, você verá: "✓ Compiled successfully"
# Depois pode deletar a pasta .next se quiser
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

---

### 3️⃣ INICIALIZAR GIT E ENVIAR PARA GITHUB

```powershell
# Ainda na pasta do projeto
cd "C:\Users\Claiton\Desktop\carros e cia\project"

# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Sistema Seminovo - Pronto para deploy"

# Adicionar repositório remoto
# ⚠️ SUBSTITUA SEU_USUARIO e SEU_REPO pelos seus dados reais!
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git

# Renomear branch para main
git branch -M main

# Fazer push
git push -u origin main
```

**⚠️ ANTES DE EXECUTAR**: 
1. Crie o repositório no GitHub primeiro
2. Substitua `SEU_USUARIO` e `SEU_REPO` pelos seus dados

---

## 🔧 CONFIGURAÇÃO NO VERCEL (Via Interface Web)

### Passo 1: Conectar GitHub
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New..."** > **"Project"**
4. Selecione seu repositório
5. Clique em **"Import"**

### Passo 2: Configurar Variáveis de Ambiente
**ANTES de clicar em "Deploy"**, adicione:

**Variável 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://xxxxx.supabase.co` (sua URL do Supabase)
- Marque: Production, Preview, Development

**Variável 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `sua-chave-anonima-aqui` (sua chave do Supabase)
- Marque: Production, Preview, Development

### Passo 3: Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos
3. Pronto! Seu site estará no ar!

---

## 🗄️ CONFIGURAR SUPABASE (Via Interface Web)

### 1. Criar Projeto
1. Acesse: https://supabase.com
2. Crie um novo projeto
3. Anote a URL e a Anon Key

### 2. Executar SQL
1. No Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo: `supabase/migrations/001_initial_schema.sql`
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** (ou F5)

### 3. Criar Usuário Admin (Opcional)
Execute no SQL Editor:

```sql
-- Criar usuário admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'admin@seminovo.com',
  crypt('senha123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Pegar o ID (copie o UUID retornado)
SELECT id FROM auth.users WHERE email = 'admin@seminovo.com';

-- Criar perfil (SUBSTITUA UUID_AQUI pelo ID do passo anterior)
INSERT INTO users_profile (auth_user_id, role, full_name, email, is_active)
VALUES (
  'UUID_AQUI',
  'admin',
  'Administrador',
  'admin@seminovo.com',
  true
);
```

---

## ✅ VERIFICAÇÃO FINAL

Após o deploy, teste:

1. ✅ Site carrega sem erros
2. ✅ Tela de login aparece
3. ✅ Login admin funciona
4. ✅ Login cliente funciona

---

## 🆘 SE DER ERRO

### Erro no build local:
```powershell
# Limpar cache e tentar novamente
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
npm run build
```

### Erro no push para GitHub:
- Verifique se criou o repositório no GitHub
- Verifique se o nome do repositório está correto
- Tente: `git remote remove origin` e adicione novamente

### Erro no Vercel:
- Verifique se as variáveis de ambiente estão configuradas
- Verifique os logs no Vercel (Deployments > View Function Logs)

---

## 📝 RESUMO DOS ARQUIVOS IMPORTANTES

- `COMANDOS_DEPLOY.md` - Guia completo detalhado
- `DEPLOY.md` - Documentação de deploy
- `README_SECURITY.md` - Guia de segurança
- `vercel.json` - Configuração do Vercel
- `.env.example` - Template de variáveis (não commitar .env!)

---

**🎉 Boa sorte com o deploy!**

