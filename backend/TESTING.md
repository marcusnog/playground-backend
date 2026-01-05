# 🧪 Guia de Testes da API

Este guia mostra como testar todos os endpoints da API.

## 📋 Pré-requisitos

1. Servidor rodando (local ou Docker)
2. Base URL: `http://localhost:3001`
3. Ferramenta para fazer requisições HTTP (curl, Postman, Insomnia, etc.)

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT. Primeiro, você precisa fazer login para obter o token.

### 1. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "apelido": "admin",
    "permissoes": {...}
  }
}
```

**Salve o token** para usar nos próximos requests:
```bash
export TOKEN="seu-token-aqui"
```

### 2. Verificar usuário autenticado

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🏥 Health Check

```bash
curl http://localhost:3001/health
```

## 📚 Endpoints Disponíveis

### 🔑 Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Dados do usuário logado | ✅ |

### 👥 Usuários (`/api/usuarios`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/usuarios` | Listar usuários | ✅ |
| GET | `/api/usuarios/:id` | Buscar por ID | ✅ |
| POST | `/api/usuarios` | Criar usuário | ✅ |
| PUT | `/api/usuarios/:id` | Atualizar usuário | ✅ |
| DELETE | `/api/usuarios/:id` | Deletar usuário | ✅ |

**Exemplos:**

```bash
# Listar usuários
curl -X GET http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer $TOKEN"

# Criar usuário
curl -X POST http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "João Silva",
    "apelido": "joao",
    "senha": "senha123",
    "contato": "11999999999"
  }'
```

### 🎮 Brinquedos (`/api/brinquedos`)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/api/brinquedos` | Listar brinquedos | ✅ | - |
| GET | `/api/brinquedos/:id` | Buscar por ID | ✅ | - |
| POST | `/api/brinquedos` | Criar brinquedo | ✅ | `parametrosBrinquedos` |
| PUT | `/api/brinquedos/:id` | Atualizar brinquedo | ✅ | `parametrosBrinquedos` |
| DELETE | `/api/brinquedos/:id` | Deletar brinquedo | ✅ | `parametrosBrinquedos` |

**Exemplos:**

```bash
# Listar brinquedos
curl -X GET http://localhost:3001/api/brinquedos \
  -H "Authorization: Bearer $TOKEN"

# Criar brinquedo
curl -X POST http://localhost:3001/api/brinquedos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Pula Pula",
    "inicialMinutos": 15,
    "valorInicial": 10.00,
    "cicloMinutos": 5,
    "valorCiclo": 5.00
  }'
```

### 💳 Formas de Pagamento (`/api/formas-pagamento`)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/api/formas-pagamento` | Listar formas | ✅ | - |
| GET | `/api/formas-pagamento/:id` | Buscar por ID | ✅ | - |
| POST | `/api/formas-pagamento` | Criar forma | ✅ | `parametrosFormasPagamento` |
| PUT | `/api/formas-pagamento/:id` | Atualizar forma | ✅ | `parametrosFormasPagamento` |
| DELETE | `/api/formas-pagamento/:id` | Deletar forma | ✅ | `parametrosFormasPagamento` |

**Exemplos:**

```bash
# Listar formas de pagamento
curl -X GET http://localhost:3001/api/formas-pagamento \
  -H "Authorization: Bearer $TOKEN"

# Criar forma de pagamento
curl -X POST http://localhost:3001/api/formas-pagamento \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "PIX",
    "status": "ativo",
    "pixChave": "chave@exemplo.com",
    "pixConta": "Conta Exemplo"
  }'
```

### 👤 Clientes (`/api/clientes`)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/api/clientes` | Listar clientes | ✅ | - |
| GET | `/api/clientes/:id` | Buscar por ID | ✅ | - |
| GET | `/api/clientes/search/:query` | Buscar clientes | ✅ | - |
| POST | `/api/clientes` | Criar cliente | ✅ | `clientes` |
| PUT | `/api/clientes/:id` | Atualizar cliente | ✅ | `clientes` |
| DELETE | `/api/clientes/:id` | Deletar cliente | ✅ | `clientes` |

**Exemplos:**

```bash
# Listar clientes
curl -X GET http://localhost:3001/api/clientes \
  -H "Authorization: Bearer $TOKEN"

# Buscar cliente
curl -X GET "http://localhost:3001/api/clientes/search/joao" \
  -H "Authorization: Bearer $TOKEN"

# Criar cliente
curl -X POST http://localhost:3001/api/clientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "contato": "11988888888"
  }'
```

### 💰 Caixas (`/api/caixas`)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/api/caixas` | Listar caixas | ✅ | - |
| GET | `/api/caixas/aberto` | Caixa aberto | ✅ | - |
| GET | `/api/caixas/:id` | Buscar por ID | ✅ | - |
| GET | `/api/caixas/:id/movimentos` | Movimentos do caixa | ✅ | - |
| POST | `/api/caixas/abertura` | Abrir caixa | ✅ | `caixaAbertura` |
| POST | `/api/caixas/fechamento` | Fechar caixa | ✅ | `caixaFechamento` |
| POST | `/api/caixas/:id/sangria` | Sangria | ✅ | `caixaSangria` |
| POST | `/api/caixas/:id/suprimento` | Suprimento | ✅ | `caixaSuprimento` |

**Exemplos:**

```bash
# Listar caixas
curl -X GET http://localhost:3001/api/caixas \
  -H "Authorization: Bearer $TOKEN"

# Abrir caixa
curl -X POST http://localhost:3001/api/caixas/abertura \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "valorInicial": 100.00,
    "observacoes": "Abertura do dia"
  }'

# Fechar caixa
curl -X POST http://localhost:3001/api/caixas/fechamento \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "observacoes": "Fechamento do dia"
  }'
```

### 📝 Lançamentos (`/api/lancamentos`)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/api/lancamentos` | Listar lançamentos | ✅ | - |
| GET | `/api/lancamentos/abertos` | Lançamentos abertos | ✅ | - |
| GET | `/api/lancamentos/:id` | Buscar por ID | ✅ | - |
| POST | `/api/lancamentos` | Criar lançamento | ✅ | `lancamento` |
| PUT | `/api/lancamentos/:id` | Atualizar lançamento | ✅ | `lancamento` |
| POST | `/api/lancamentos/:id/pagar` | Pagar lançamento | ✅ | `lancamento` |
| POST | `/api/lancamentos/:id/cancelar` | Cancelar lançamento | ✅ | `lancamento` |

**Exemplos:**

```bash
# Listar lançamentos
curl -X GET http://localhost:3001/api/lancamentos \
  -H "Authorization: Bearer $TOKEN"

# Criar lançamento
curl -X POST http://localhost:3001/api/lancamentos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "cliente-id",
    "brinquedoId": "brinquedo-id",
    "formaPagamentoId": "forma-pagamento-id",
    "inicialMinutos": 15,
    "ciclosAdicionais": 2
  }'
```

### 🚗 Estacionamentos (`/api/estacionamentos`)

#### Estacionamentos

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/api/estacionamentos` | Listar estacionamentos | ✅ | - |
| GET | `/api/estacionamentos/:id` | Buscar por ID | ✅ | - |
| POST | `/api/estacionamentos` | Criar estacionamento | ✅ | `estacionamentoCadastro` |
| PUT | `/api/estacionamentos/:id` | Atualizar estacionamento | ✅ | `estacionamentoCadastro` |
| DELETE | `/api/estacionamentos/:id` | Deletar estacionamento | ✅ | `estacionamentoCadastro` |

#### Lançamentos de Estacionamento

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/api/estacionamentos/lancamentos` | Listar lançamentos | ✅ | - |
| GET | `/api/estacionamentos/lancamentos/abertos` | Lançamentos abertos | ✅ | - |
| GET | `/api/estacionamentos/lancamentos/:id` | Buscar por ID | ✅ | - |
| POST | `/api/estacionamentos/lancamentos` | Criar lançamento | ✅ | `estacionamentoLancamento` |
| POST | `/api/estacionamentos/lancamentos/:id/pagar` | Pagar lançamento | ✅ | `estacionamentoLancamento` |
| POST | `/api/estacionamentos/lancamentos/:id/cancelar` | Cancelar lançamento | ✅ | `estacionamentoLancamento` |

#### Caixa de Estacionamento

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/api/estacionamentos/caixa/abertura` | Dados abertura | ✅ | `estacionamentoCaixaAbertura` |
| POST | `/api/estacionamentos/caixa/abertura` | Abrir caixa | ✅ | `estacionamentoCaixaAbertura` |
| POST | `/api/estacionamentos/caixa/fechamento` | Fechar caixa | ✅ | `estacionamentoCaixaFechamento` |

**Exemplos:**

```bash
# Listar estacionamentos
curl -X GET http://localhost:3001/api/estacionamentos \
  -H "Authorization: Bearer $TOKEN"

# Criar lançamento de estacionamento
curl -X POST http://localhost:3001/api/estacionamentos/lancamentos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estacionamentoId": "estacionamento-id",
    "placa": "ABC1234",
    "formaPagamentoId": "forma-pagamento-id"
  }'
```

### ⚙️ Parâmetros (`/api/parametros`)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/api/parametros` | Obter parâmetros | ✅ | - |
| PUT | `/api/parametros` | Atualizar parâmetros | ✅ | `parametrosEmpresa` |

**Exemplos:**

```bash
# Obter parâmetros
curl -X GET http://localhost:3001/api/parametros \
  -H "Authorization: Bearer $TOKEN"

# Atualizar parâmetros
curl -X PUT http://localhost:3001/api/parametros \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeEmpresa": "Playground Exemplo",
    "cnpj": "12.345.678/0001-90",
    "endereco": "Rua Exemplo, 123"
  }'
```

## 🛠️ Ferramentas Recomendadas

### 1. **curl** (Terminal)
Já mostrado nos exemplos acima.

### 2. **HTTPie** (Terminal)
Mais amigável que curl:

```bash
# Instalar
brew install httpie  # macOS
# ou
pip install httpie

# Usar
http POST localhost:3001/api/auth/login username=admin password=senha123
http GET localhost:3001/api/brinquedos "Authorization:Bearer $TOKEN"
```

### 3. **Postman** ou **Insomnia**
Importe a coleção abaixo ou crie manualmente.

### 4. **Thunder Client** (VS Code)
Extensão do VS Code para testar APIs diretamente no editor.

## 📦 Coleção Postman/Insomnia

Crie uma coleção com as seguintes variáveis:

- `baseUrl`: `http://localhost:3001`
- `token`: (será preenchido após login)

### Variáveis de Ambiente

```json
{
  "baseUrl": "http://localhost:3001",
  "token": ""
}
```

## 🔍 Testando com Scripts

Crie um arquivo `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "🔐 Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Erro no login"
  exit 1
fi

echo "✅ Login realizado com sucesso!"
echo "Token: ${TOKEN:0:20}..."

echo ""
echo "🏥 Testando health check..."
curl -s $BASE_URL/health | jq

echo ""
echo "📚 Listando brinquedos..."
curl -s -X GET $BASE_URL/api/brinquedos \
  -H "Authorization: Bearer $TOKEN" | jq

echo ""
echo "✅ Testes concluídos!"
```

Torne executável e execute:
```bash
chmod +x test-api.sh
./test-api.sh
```

## 🐛 Troubleshooting

### Erro 401 (Unauthorized)
- Verifique se o token está sendo enviado corretamente
- Verifique se o token não expirou (faça login novamente)
- Formato correto: `Authorization: Bearer <token>`

### Erro 403 (Forbidden)
- Verifique se o usuário tem a permissão necessária
- Use `GET /api/auth/me` para ver as permissões do usuário

### Erro 404 (Not Found)
- Verifique se o servidor está rodando
- Verifique se a URL está correta
- Verifique se o ID do recurso existe

### Erro 500 (Internal Server Error)
- Verifique os logs do servidor
- Verifique se o banco de dados está configurado corretamente
- Verifique se todas as variáveis de ambiente estão configuradas

## 📝 Notas

- Todos os endpoints (exceto `/health` e `/api/auth/login`) requerem autenticação
- O token JWT expira após um período (verifique a configuração)
- Alguns endpoints requerem permissões específicas além da autenticação
- Use `Content-Type: application/json` para requisições POST/PUT

