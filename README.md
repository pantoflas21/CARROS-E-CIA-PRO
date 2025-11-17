# 🚗 SEMINOVO - Sistema de Gestão de Vendas

Sistema profissional, moderno e seguro para gestão de vendas de carros e motos seminovos.

![Status](https://img.shields.io/badge/status-pronto%20para%20deploy-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📌 Visão Geral

O SEMINOVO atende três áreas distintas:
- **Administrador**: Gestão total com dashboards e relatórios
- **Vendedor**: Acompanhamento de vendas e comissões
- **Cliente**: Consulta de parcelas e download de boletos

## ✨ Principais Features

- 🔐 Autenticação segura por role
- 📊 Dashboards com gráficos Recharts
- 🚗 Gestão completa de inventário
- 👥 Gerenciamento de clientes
- 💰 Sistema de contratos e parcelas
- 📋 Download de boletos em PDF
- 🎨 Interface moderna com tema claro/escuro
- 📱 Responsividade total
- 🔒 Row Level Security (RLS)
- 🛡️ Segurança implementada (headers, validação, rate limiting)

## 🚀 Quick Start

### Instalação Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Copie .env.example para .env.local e preencha com suas credenciais do Supabase

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Deploy Rápido

**📋 Veja o arquivo `COMANDOS_COPIAR_COLAR.md` para comandos prontos!**

1. Configure o Supabase (veja `COMANDOS_DEPLOY.md`)
2. Envie para GitHub
3. Configure no Vercel
4. Pronto! 🎉

## 📚 Documentação

- **[COMANDOS_COPIAR_COLAR.md](./COMANDOS_COPIAR_COLAR.md)** - ⭐ COMANDOS PRONTOS PARA COPIAR E COLAR
- **[COMANDOS_DEPLOY.md](./COMANDOS_DEPLOY.md)** - Guia completo passo a passo
- **[DEPLOY.md](./DEPLOY.md)** - Documentação de deploy
- **[README_SECURITY.md](./README_SECURITY.md)** - Guia de segurança
- **[SETUP.md](./SETUP.md)** - Guia de setup detalhado

## 🔐 Segurança

O sistema implementa:
- ✅ Validação e sanitização de inputs
- ✅ Rate limiting
- ✅ Headers de segurança
- ✅ Autenticação segura
- ✅ Validação de roles
- ✅ Logging seguro
- ✅ Proteção contra XSS e CSRF

Veja mais em `README_SECURITY.md`.

## 💻 Stack Tecnológico

- **Next.js 16** - Framework React
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Supabase** - Backend (PostgreSQL + Auth)
- **Recharts** - Gráficos
- **Class Variance Authority** - Component variants

## 📋 Pré-requisitos para Deploy

- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) ou outro provedor
- Conta no [GitHub](https://github.com)
- Node.js 18+

## 🌍 Deploy

Pronto para deploy em:
- ✅ Vercel (recomendado)
- ✅ Netlify
- ✅ Railway
- ✅ Qualquer plataforma que suporte Next.js

Veja `COMANDOS_DEPLOY.md` para instruções detalhadas.

## 📄 Licença

MIT

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs do Vercel
2. Verifique os logs do Supabase
3. Consulte a documentação em `COMANDOS_DEPLOY.md`
4. Verifique o console do navegador (F12)

---

**Desenvolvido com ❤️ para gestão de vendas**
