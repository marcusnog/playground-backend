#!/bin/bash
# setup-server.sh — Configura o servidor do zero para rodar o playground-backend
# Uso: bash setup-server.sh (execute como root no servidor 45.233.129.73)

set -e

REPO_URL="https://github.com/marcusnog/playground-backend.git"
APP_DIR="/root/playground-backend"
BACKEND_DIR="$APP_DIR/backend"

echo "======================================"
echo " Setup do servidor playground-backend"
echo "======================================"

if ! command -v docker &>/dev/null; then
  echo "[1/5] Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker && systemctl start docker
else
  echo "[1/5] Docker já instalado: $(docker --version)"
fi

if ! docker compose version &>/dev/null; then
  apt-get install -y docker-compose-plugin
fi

if [ -d "$APP_DIR/.git" ]; then
  echo "[2/5] Repositório já existe — fazendo git pull..."
  git -C "$APP_DIR" pull origin main
else
  echo "[2/5] Clonando repositório em $APP_DIR..."
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "[3/5] Configurando .env..."
if [ -f "$BACKEND_DIR/.env" ]; then
  echo "      .env já existe. Pulando."
else
  JWT_SECRET=$(openssl rand -base64 32)
  cat > "$BACKEND_DIR/.env" <<EOF
NODE_ENV=production
PORT=3001
JWT_SECRET=$JWT_SECRET
POSTGRES_USER=playground
POSTGRES_PASSWORD=TROQUE_ESTA_SENHA
POSTGRES_DB=playground
DATABASE_URL=postgresql://playground:TROQUE_ESTA_SENHA@postgres:5432/playground
CORS_ORIGIN=http://localhost:3000
MASTER_PASSWORD=TROQUE_ESTA_SENHA
ADMIN_PASSWORD=TROQUE_ESTA_SENHA
# ANTHROPIC_API_KEY=
EOF
  echo ""
  echo "  !! ATENÇÃO: Edite $BACKEND_DIR/.env antes de continuar !!"
  read -p "  Pressione Enter após editar o .env para continuar..." -r
fi

echo "[4/5] Subindo containers..."
cd "$BACKEND_DIR"
docker compose -f docker-compose.prod.yml up -d --build

echo "[5/5] Aguardando PostgreSQL..."
for i in $(seq 1 30); do
  if docker compose -f docker-compose.prod.yml exec postgres pg_isready -U playground &>/dev/null; then
    echo "      PostgreSQL pronto."
    break
  fi
  echo "      Aguardando... ($i/30)" && sleep 2
done

echo ""
echo "======================================"
echo " Servidor configurado com sucesso!"
echo "======================================"
echo "Próximos passos:"
echo "  Instalação nova: docker compose -f docker-compose.prod.yml exec backend npx prisma db seed"
echo "  Migração Render: bash $BACKEND_DIR/scripts/migrate-db.sh"
