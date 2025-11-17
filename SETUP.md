# Sistema Seminovo - Guia de Setup

Um sistema completo de gestão de vendas de carros e motos seminovos com áreas distintas para Administrador, Vendedor e Cliente.

## 🚀 Tecnologias Utilizadas

- **Next.js 16** - Framework React com Server Components
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Supabase** - Backend (PostgreSQL + Auth)
- **Recharts** - Gráficos e análises
- **CVA** - Component Variants

## 📋 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx              - Layout raiz
│   ├── page.tsx                - Redireciona para login
│   ├── globals.css             - Estilos globais
│   ├── login/                  - Página de login
│   ├── admin/                  - Dashboard administrativo
│   ├── vendedor/               - Área do vendedor
│   └── cliente/                - Área do cliente
├── components/
│   ├── ui/                     - Componentes reutilizáveis
│   ├── layout/                 - Layouts e providers
│   └── common/                 - Componentes comuns
├── lib/
│   ├── supabase.ts            - Cliente Supabase
│   └── utils.ts               - Funções utilitárias
└── types/
    └── index.ts               - Tipos TypeScript
```

## 🔧 Variáveis de Ambiente

Criar arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 📲 Áreas de Acesso

### 1. Administrador & Vendedor
- **Login**: Email + Senha
- **URL**: `/admin` ou `/vendedor`

Demo:
- Email: `admin@seminovo.com`
- Senha: `senha123`

### 2. Cliente
- **Login**: CPF + Data de Nascimento (sem senha)
- **URL**: `/cliente`
- Acesso simples e seguro

## 🎯 Funcionalidades Principais

### Área do Cliente (Foco Principal)
- ✅ Login com CPF e data de nascimento
- ✅ Visualizar parcelas em aberto e pagas
- ✅ Download de boletos em PDF
- ✅ Acesso ao contrato do veículo
- ✅ Histórico completo de pagamentos
- ✅ Informações do veículo comprado
- ✅ Status de pagamento (em dia / atrasado)

### Área do Administrador
- ✅ Dashboard com gráficos (Recharts)
- ✅ CRUD de veículos
- ✅ Gestão de clientes
- ✅ Gestão de contratos
- ✅ Gestão de vendedores
- ✅ Relatórios de vendas
- ✅ Filtros avançados

### Área do Vendedor
- ✅ Painel com metas e vendas
- ✅ Listagem de veículos disponíveis
- ✅ Cadastro rápido de clientes
- ✅ Acompanhamento de contratos
- ✅ Cálculo de comissão

## 🗄️ Banco de Dados

### Tabelas Principais
- `users_profile` - Usuários (admin, vendedor, cliente)
- `vehicles` - Inventário de carros e motos
- `clients` - Dados dos clientes
- `contracts` - Contratos de financiamento
- `installments` - Parcelas
- `payment_history` - Histórico de pagamentos
- `activity_logs` - Auditoria de ações

### Setup do Banco

1. Acessar [Supabase](https://supabase.io)
2. Executar SQL em `supabase/migrations/001_initial_schema.sql`
3. Tabelas serão criadas com RLS (Row Level Security)

## 🌓 Tema Claro/Escuro

- Sistema automático detecta preferência do SO
- Toggle de tema em desenvolvimento
- Persiste em localStorage

## 🔐 Segurança

- ✅ RLS habilitado em todas as tabelas
- ✅ Autenticação Supabase nativa
- ✅ Validação de CPF e email
- ✅ Logs de atividade
- ✅ Permissões por role

## 📦 Deploy

### Vercel

1. Fazer push do repositório para GitHub
2. Conectar repositório no [Vercel](https://vercel.com)
3. Adicionar variáveis de ambiente
4. Deploy automático

```bash
npm run build
npm run start
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

Acesse: `http://localhost:3000`

## 📱 Responsividade

- ✅ Mobile-first design
- ✅ Breakpoints: sm, md, lg, xl
- ✅ Touch-friendly interface

## 🎨 Design

- Cores profissionais (azul, verde, laranja)
- Tipografia clara e legível
- Ícones e micro-interações
- Dark mode suportado
- Contraste acessível

## 📊 Funcionalidades Extras

- ✅ Gráficos com Recharts
- ✅ Upload de PDFs
- ✅ Busca inteligente com filtros
- ✅ Exportação de dados
- ✅ Sistema de permissões
- ✅ Logs de auditoria

## 🐛 Troubleshooting

### Erro de conexão Supabase
- Verificar variáveis de ambiente
- Confirmar credenciais no `.env.local`

### Erro de autenticação
- Garantir que tabelas foram criadas
- Verificar RLS policies

### Build falha
- Limpar cache: `npm run clean` ou deletar `.next`
- Reinstalar dependências: `rm -rf node_modules && npm install`

## 📞 Suporte

Para questões sobre:
- **Supabase**: https://supabase.io/docs
- **Next.js**: https://nextjs.org/docs
- **TailwindCSS**: https://tailwindcss.com/docs

## ✅ Checklist Antes do Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] Login testado
- [ ] Funcionalidades principais testadas
- [ ] Dark mode funcionando
- [ ] Responsividade verificada
- [ ] Build sem erros
