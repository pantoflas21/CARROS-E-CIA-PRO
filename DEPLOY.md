# 🚀 Guia de Deploy - Sistema Seminovo

Este guia fornece instruções passo a passo para fazer deploy do sistema em produção.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) (recomendado) ou outro provedor
- Git configurado
- Node.js 18+ instalado localmente

## 🔧 Passo 1: Configurar Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a Anon Key (Settings > API)

### 1.2 Executar Migrações

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute o arquivo `supabase/migrations/001_initial_schema.sql`
3. Execute o arquivo `supabase/migrations/002_seed_demo_data.sql` (opcional, apenas para dados de teste)

### 1.3 Configurar Row Level Security (RLS)

Configure as políticas RLS no Supabase. Veja exemplos em `README_SECURITY.md`.

## 🔐 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Localmente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 2.2 No Vercel

1. Acesse seu projeto no Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🏗️ Passo 3: Build Local (Teste)

```bash
# Instalar dependências
npm install

# Fazer build
npm run build

# Testar localmente
npm start
```

## 🚀 Passo 4: Deploy no Vercel

### Opção 1: Via Git (Recomendado)

1. Faça push do código para GitHub/GitLab/Bitbucket
2. No Vercel, clique em **New Project**
3. Conecte seu repositório
4. Configure as variáveis de ambiente
5. Clique em **Deploy**

### Opção 2: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Para produção
vercel --prod
```

## ✅ Passo 5: Verificações Pós-Deploy

- [ ] Acesse a URL de produção
- [ ] Teste login de admin/vendedor
- [ ] Teste login de cliente
- [ ] Verifique headers de segurança (use [SecurityHeaders.com](https://securityheaders.com))
- [ ] Teste todas as funcionalidades principais

## 🔒 Passo 6: Segurança em Produção

1. **Desabilite modo debug**: Certifique-se que `NODE_ENV=production`
2. **Configure RLS**: Políticas de segurança no Supabase
3. **Monitore logs**: Configure alertas para erros
4. **Backup**: Configure backup automático no Supabase
5. **HTTPS**: Vercel fornece HTTPS automaticamente

## 📊 Passo 7: Monitoramento

### Opcional: Configurar Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"

- Verifique se as variáveis estão configuradas no Vercel
- Certifique-se que os nomes estão corretos (com `NEXT_PUBLIC_`)

### Erro: "Acesso negado" no login

- Verifique se o RLS está configurado corretamente
- Verifique se o usuário existe na tabela `users_profile`

### Build falha

- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente para verificar erros

## 📚 Recursos

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)

## 🆘 Suporte

Em caso de problemas, verifique:
1. Logs do Vercel (Deployments > View Function Logs)
2. Logs do Supabase (Logs > Postgres Logs)
3. Console do navegador (F12)

