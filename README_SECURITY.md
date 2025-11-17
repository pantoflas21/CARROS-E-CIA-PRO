# 🔒 Guia de Segurança - Sistema Seminovo

Este documento descreve as medidas de segurança implementadas no sistema.

## ✅ Medidas de Segurança Implementadas

### 1. Autenticação e Autorização

- **Autenticação via Supabase Auth**: Login seguro com email/senha para admin e vendedores
- **Validação de Roles**: Middleware verifica permissões antes de acessar rotas protegidas
- **Sessões Seguras**: Uso de sessionStorage com expiração para clientes
- **Proteção de Rotas**: Middleware Next.js protege rotas administrativas

### 2. Validação e Sanitização

- **Sanitização de Inputs**: Todos os inputs são sanitizados antes do processamento
- **Validação de CPF**: Validação completa do algoritmo de CPF brasileiro
- **Validação de Email**: Regex e validação de formato
- **Validação de Datas**: Verificação de formato e validade
- **Validação de URLs**: Verificação antes de abrir links externos

### 3. Rate Limiting

- **Proteção contra Brute Force**: Limite de 5 tentativas por minuto por usuário
- **Rate Limiting por IP**: Proteção adicional baseada em identificador

### 4. Headers de Segurança

- **X-Content-Type-Options**: Previne MIME type sniffing
- **X-Frame-Options**: Previne clickjacking
- **X-XSS-Protection**: Proteção contra XSS
- **Strict-Transport-Security**: Força HTTPS
- **Content-Security-Policy**: Política de segurança de conteúdo
- **Referrer-Policy**: Controla informações de referência

### 5. Variáveis de Ambiente

- **Validação Obrigatória**: Sistema não inicia sem variáveis de ambiente configuradas
- **Arquivo .env.example**: Template para configuração
- **Gitignore**: Arquivos .env não são versionados

### 6. Logging Seguro

- **Logger Customizado**: Sistema de logging que não expõe informações sensíveis
- **Sanitização de Logs**: Senhas, tokens e dados sensíveis são mascarados
- **Logs Apenas em Desenvolvimento**: Logs de debug apenas em modo desenvolvimento

### 7. Proteção de Dados

- **SessionStorage**: Dados sensíveis em sessionStorage (limpo ao fechar navegador)
- **Sem Credenciais Hardcoded**: Remoção de credenciais de exemplo do código
- **Validação de Sessão**: Verificação de expiração de sessão

### 8. Middleware de Segurança

- **Proteção de Rotas**: Middleware Next.js valida autenticação e roles
- **Redirecionamento Seguro**: Redireciona usuários não autorizados
- **Headers Globais**: Aplica headers de segurança em todas as rotas

## 🚀 Configuração para Produção

### Variáveis de Ambiente Obrigatórias

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] RLS (Row Level Security) habilitado no Supabase
- [ ] Políticas de segurança configuradas no Supabase
- [ ] HTTPS habilitado
- [ ] Headers de segurança verificados
- [ ] Logs de produção configurados
- [ ] Backup do banco de dados configurado

## 🔐 Políticas RLS Recomendadas (Supabase)

Configure as seguintes políticas no Supabase:

### users_profile
- SELECT: Usuários podem ver apenas seu próprio perfil
- UPDATE: Apenas admins podem atualizar perfis

### vehicles
- SELECT: Todos autenticados podem ver veículos disponíveis
- INSERT: Apenas vendedores e admins podem criar
- UPDATE: Apenas criador ou admin pode atualizar

### contracts
- SELECT: Vendedores veem seus contratos, clientes veem seus contratos
- INSERT: Apenas vendedores e admins podem criar

### clients
- SELECT: Clientes veem apenas seus próprios dados
- INSERT: Apenas vendedores e admins podem criar

## ⚠️ Avisos Importantes

1. **Nunca commite arquivos .env**
2. **Use senhas fortes em produção**
3. **Configure RLS adequadamente no Supabase**
4. **Monitore logs de segurança regularmente**
5. **Mantenha dependências atualizadas**

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

