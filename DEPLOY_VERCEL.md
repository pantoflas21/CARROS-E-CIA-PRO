# 🚀 Deploy na Vercel - Guia Completo

Este guia fornece instruções passo a passo para fazer deploy do sistema na Vercel.

## 📋 Pré-requisitos

- ✅ Conta no [Supabase](https://supabase.com)
- ✅ Conta no [Vercel](https://vercel.com)
- ✅ Conta no [GitHub](https://github.com)
- ✅ Projeto configurado localmente

## 🔧 Passo 1: Preparar o Projeto

### 1.1 Verificar Build Local

```bash
cd project
npm run build
```

Se o build funcionar localmente, está pronto para deploy!

### 1.2 Commit e Push para GitHub

```bash
# Adicionar todos os arquivos
git add .

# Commit
git commit -m "Sistema pronto para deploy"

# Push para GitHub
git push origin main
```

## 🌐 Passo 2: Configurar Vercel

### 2.1 Criar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New Project**
3. Conecte seu repositório GitHub
4. Selecione o repositório do projeto
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `project` (se o projeto estiver em uma subpasta)
   - **Build Command**: `npm run build` (já configurado)
   - **Output Directory**: `.next` (já configurado)
   - **Install Command**: `npm install` (já configurado)

### 2.2 Configurar Variáveis de Ambiente

Na tela de configuração do projeto, vá em **Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-chave-anonima
```

**Importante:**
- ✅ Selecione todos os ambientes (Production, Preview, Development)
- ✅ Use os mesmos valores do seu `.env.local` local

### 2.3 Deploy

1. Clique em **Deploy**
2. Aguarde o build completar (geralmente 2-5 minutos)
3. Se houver erros, verifique os logs

## ✅ Passo 3: Verificações Pós-Deploy

### 3.1 Testar o Site

1. Acesse a URL fornecida pela Vercel
2. Teste a página de login
3. Verifique se todas as rotas funcionam:
   - `/` → Redireciona para `/login`
   - `/login` → Página de login
   - `/admin` → Dashboard admin (após login)
   - `/vendedor` → Dashboard vendedor (após login)
   - `/cliente` → Área do cliente (após login)

### 3.2 Verificar Console

1. Abra o DevTools (F12)
2. Verifique se há erros no console
3. Verifique se há erros na aba Network

### 3.3 Verificar Logs da Vercel

1. Na Vercel, vá em **Deployments**
2. Clique no último deployment
3. Verifique os logs de build
4. Verifique os logs de runtime (se houver)

## 🔧 Passo 4: Configurações Avançadas

### 4.1 Domínio Personalizado

1. Na Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure os DNS conforme instruções
4. Aguarde a propagação (pode levar até 24h)

### 4.2 Configurar Preview Deployments

As preview deployments são criadas automaticamente para cada PR. Certifique-se de que as variáveis de ambiente estão configuradas para **Preview** também.

### 4.3 Configurar Analytics (Opcional)

1. Na Vercel, vá em **Analytics**
2. Ative o Analytics (plano pago)
3. Configure conforme necessário

## 🐛 Solução de Problemas

### Erro: "Build Failed"

**Possíveis causas:**
- Variáveis de ambiente não configuradas
- Erro de sintaxe no código
- Dependências faltando

**Solução:**
1. Verifique os logs de build na Vercel
2. Teste o build localmente: `npm run build`
3. Verifique se todas as dependências estão no `package.json`

### Erro: "Environment Variables Missing"

**Solução:**
1. Vá em **Settings** > **Environment Variables**
2. Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configuradas
3. Certifique-se de que estão selecionadas para o ambiente correto

### Erro: "404 Not Found" nas rotas

**Possíveis causas:**
- Problema com o middleware
- Rotas não configuradas corretamente

**Solução:**
1. Verifique o arquivo `middleware.ts`
2. Verifique se as rotas estão corretas em `src/app/`
3. Verifique os logs da Vercel

### Erro: "Supabase Connection Failed"

**Solução:**
1. Verifique se as credenciais do Supabase estão corretas
2. Verifique se o projeto Supabase está ativo
3. Verifique se as políticas RLS estão configuradas

## 📊 Monitoramento

### Logs em Tempo Real

1. Na Vercel, vá em **Deployments**
2. Clique no deployment ativo
3. Vá em **Functions** para ver logs de runtime

### Performance

1. Use o **Vercel Analytics** (se ativado)
2. Use o **Lighthouse** do Chrome DevTools
3. Monitore o tempo de resposta das APIs

## 🔄 Atualizações

Para atualizar o site:

1. Faça as alterações no código
2. Commit e push para GitHub
3. A Vercel fará deploy automático
4. Aguarde o build completar

## 📝 Checklist Final

- [ ] Build local funcionando (`npm run build`)
- [ ] Código commitado e enviado para GitHub
- [ ] Projeto criado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Site acessível e funcionando
- [ ] Login testado
- [ ] Todas as rotas testadas
- [ ] Sem erros no console
- [ ] Performance aceitável

## 🎉 Pronto!

Seu sistema está no ar! 🚀

---

**Dúvidas?** Consulte:
- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- Arquivo `COMANDOS_DEPLOY.md` para comandos prontos

