# Credenciais de Demonstração

## 👤 Admin

- **Email**: `admin@seminovo.com`
- **Senha**: `senha123`
- **Acesso**: http://localhost:3000/admin

## 👥 Vendedor

- **Email**: `vendedor@seminovo.com`
- **Senha**: `senha123`
- **Acesso**: http://localhost:3000/vendedor

## 👨‍💼 Clientes

Os clientes acessam via CPF + Data de Nascimento (sem senha).

### Cliente 1
- **CPF**: `123.456.789-00`
- **Data de Nascimento**: `01/01/1990`
- **Nome**: João Silva
- **Acesso**: http://localhost:3000/cliente

### Cliente 2
- **CPF**: `987.654.321-00`
- **Data de Nascimento**: `15/05/1985`
- **Nome**: Maria Santos
- **Acesso**: http://localhost:3000/cliente

## 🚗 Veículos de Exemplo

| Marca | Modelo | Ano | Valor |
|-------|--------|-----|-------|
| Toyota | Corolla | 2020 | R$ 85.000 |
| Honda | Civic | 2019 | R$ 95.000 |
| Ford | Fiesta | 2018 | R$ 60.000 |
| Yamaha | XJ6 | 2021 | R$ 28.000 |
| Honda | CB 500 | 2020 | R$ 32.000 |

## 💰 Contratos de Exemplo

| Contrato | Cliente | Veículo | Parcelas | Valor Parcela |
|----------|---------|---------|----------|---------------|
| CT-001 | João Silva | Toyota Corolla | 60 | R$ 1.416 |
| CT-002 | Maria Santos | Honda Civic | 48 | R$ 1.979 |

## 📌 Notas

- Todas as senhas são **`senha123`**
- CPFs são fictícios para demo
- Dados são apenas para teste
- Em produção, usar dados reais
- Sistema RLS garante isolamento de dados

## 🔑 Primeiros Passos

1. **Admin**: Acesse o painel administrativo
2. **Criar Cliente**: Use a área de gestão
3. **Criar Veículo**: Cadastre um carro/moto
4. **Criar Contrato**: Gere um contrato
5. **Testar Boletos**: Download de PDFs
6. **Verificar Cliente**: Acesse como cliente final
