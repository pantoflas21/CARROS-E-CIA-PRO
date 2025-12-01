# Configuração de Variáveis de Ambiente

## Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto (`project/.env.local`) com o seguinte conteúdo:

```env
# URL do seu projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave Anônima (Anon Key) do Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

## Como Obter as Credenciais

1. Acesse [https://supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** > **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Importante

- ⚠️ **NUNCA** commite o arquivo `.env.local` no Git
- ✅ O arquivo `.env.local` já está no `.gitignore`
- ✅ Use `.env.example` como referência (não contém valores reais)

## Para Deploy na Vercel

1. Acesse seu projeto na Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione as mesmas variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Selecione os ambientes (Production, Preview, Development)
5. Faça o deploy novamente

