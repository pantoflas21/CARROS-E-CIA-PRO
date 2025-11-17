# 🎯 Primeiro Passo - Guia de Execução

Parabéns! Você tem um sistema completo de gestão de vendas. Siga estes passos para começar.

## 1️⃣ Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Abra .env.local e adicione suas credenciais Supabase:
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

> Onde pegar as credenciais?
> - Entre em https://supabase.io
> - Acesse seu projeto
> - Vá em Settings > API
> - Copie URL e Anon Key

## 2️⃣ Criar Tabelas no Banco

Execute o SQL em Supabase:

1. Vá em https://supabase.io
2. Abra seu projeto
3. Clique em "SQL Editor"
4. Clique em "New query"
5. Copie o conteúdo de: `supabase/migrations/001_initial_schema.sql`
6. Cole na query e execute
7. Espere completar

## 3️⃣ Criar Usuários Admin

Execute em SQL Editor:

```sql
-- Criar admin user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@seminovo.com',
  crypt('senha123', gen_salt('bf')),
  now()
);

-- Pegar o ID do usuário criado (SELECT id FROM auth.users WHERE email = 'admin@seminovo.com')
-- E rodar:
INSERT INTO users_profile (auth_user_id, role, full_name, email)
VALUES ('SEU_UUID_AQUI', 'admin', 'Admin Seminovo', 'admin@seminovo.com');
```

## 4️⃣ Criar Clientes de Teste

Execute em SQL Editor:

```sql
INSERT INTO clients (cpf, full_name, email, phone, birth_date)
VALUES
  ('12345678900', 'João Silva', 'joao@email.com', '(11) 99999-0001', '1990-01-01'),
  ('98765432100', 'Maria Santos', 'maria@email.com', '(11) 99999-0002', '1985-05-15');
```

## 5️⃣ Rodar o Projeto Localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

## 6️⃣ Testar o Login

### Como Admin:
1. Clique em "Administrador / Vendedor"
2. Email: `admin@seminovo.com`
3. Senha: `senha123`

### Como Cliente:
1. Clique em "Área do Cliente"
2. CPF: `123.456.789-00`
3. Data: `01/01/1990`

## ⚠️ Possíveis Problemas

### "Erro ao conectar com Supabase"
- Verificar .env.local
- Confirmar URL e keys
- Testar conexão em https://supabase.io

### "Tabelas não encontradas"
- Executar SQL migration em Supabase
- Verificar se migration completou

### "Login não funciona"
- Verificar se admin foi criado
- Conferir email e senha
- Ver console do navegador para erros

## 🎓 Próximos Passos

### Adicionar Dados
- Crie mais clientes em SQL
- Adicione veículos via admin
- Crie contratos

### Testar Funcionalidades
- Admin: Veja dashboard
- Vendedor: Crie um vendedor
- Cliente: Consulte parcelas

### Customizar
- Adicione seu logo
- Mude cores em globals.css
- Adapte textos

## 📚 Documentação

- **SETUP.md** - Guia completo
- **README.md** - Visão geral
- **DEMO_CREDENTIALS.md** - Credenciais
- **PROJECT_SUMMARY.md** - Sumário técnico

## 🚀 Deploy

Quando pronto:

1. Fazer push para GitHub
2. Conectar no Vercel
3. Adicionar env vars
4. Deploy automático

## 💡 Dicas

- Use Chrome DevTools para debug
- Verifique console para errors
- Teste em mobile também
- Deixe feedback no console

## ✅ Checklist

- [ ] .env.local configurado
- [ ] SQL executado em Supabase
- [ ] Admin criado
- [ ] Clientes criados
- [ ] npm run dev funcionando
- [ ] Login testado
- [ ] Admin dashboard visível
- [ ] Cliente pode acessar

---

## 🎯 Pronto?

Tudo configurado? Agora é com você!

Aproveite o sistema e sucesso com suas vendas! 🎉
