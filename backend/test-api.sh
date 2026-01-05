#!/bin/bash

# Script de teste da API
# Uso: ./test-api.sh [username] [password]

BASE_URL="${BASE_URL:-http://localhost:3001}"
USERNAME="${1:-admin}"
PASSWORD="${2:-senha123}"

echo "🧪 Testando API Playground Backend"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para fazer requisições
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo -e "${YELLOW}→${NC} $description"
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓${NC} Status: $http_code"
    if [ ! -z "$body" ] && [ "$body" != "null" ]; then
      echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
  else
    echo -e "${RED}✗${NC} Status: $http_code"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  fi
  echo ""
}

# 1. Health Check
echo "🏥 Health Check"
echo "---------------"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
  echo -e "${GREEN}✓${NC} Servidor está rodando"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
  echo -e "${RED}✗${NC} Servidor não está respondendo (Status: $http_code)"
  exit 1
fi
echo ""

# 2. Login
echo "🔐 Autenticação"
echo "---------------"
echo "Fazendo login com usuário: $USERNAME"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}✗${NC} Erro no login"
  echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓${NC} Login realizado com sucesso!"
USER_INFO=$(echo "$LOGIN_RESPONSE" | jq -r '.user.apelido' 2>/dev/null)
echo "Usuário: $USER_INFO"
echo "Token: ${TOKEN:0:30}..."
echo ""

# 3. Verificar usuário autenticado
make_request "GET" "/api/auth/me" "" "Verificando usuário autenticado"

# 4. Testar endpoints principais
echo "📚 Testando Endpoints Principais"
echo "================================="
echo ""

# Brinquedos
make_request "GET" "/api/brinquedos" "" "Listando brinquedos"

# Formas de Pagamento
make_request "GET" "/api/formas-pagamento" "" "Listando formas de pagamento"

# Clientes
make_request "GET" "/api/clientes" "" "Listando clientes"

# Caixas
make_request "GET" "/api/caixas" "" "Listando caixas"
make_request "GET" "/api/caixas/aberto" "" "Verificando caixa aberto"

# Lançamentos
make_request "GET" "/api/lancamentos" "" "Listando lançamentos"
make_request "GET" "/api/lancamentos/abertos" "" "Listando lançamentos abertos"

# Estacionamentos
make_request "GET" "/api/estacionamentos" "" "Listando estacionamentos"
make_request "GET" "/api/estacionamentos/lancamentos/abertos" "" "Listando lançamentos de estacionamento abertos"

# Parâmetros
make_request "GET" "/api/parametros" "" "Obtendo parâmetros"

# Usuários
make_request "GET" "/api/usuarios" "" "Listando usuários"

echo ""
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo "💡 Dica: Use o token abaixo para testar manualmente:"
echo "export TOKEN=\"$TOKEN\""
echo ""
echo "Exemplo:"
echo "curl -X GET $BASE_URL/api/brinquedos -H \"Authorization: Bearer \$TOKEN\""

