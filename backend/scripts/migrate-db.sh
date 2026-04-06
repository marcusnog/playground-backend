#!/bin/bash
# migrate-db.sh — Migra o banco do Render.com para o novo servidor
# Uso (na sua máquina local): RENDER_DATABASE_URL="postgresql://..." bash migrate-db.sh

set -e

DEST_HOST="${DEST_HOST:-45.233.129.73}"
DEST_PORT="${DEST_PORT:-1101}"
DEST_USER="${DEST_USER:-root}"
DEST_APP_DIR="${DEST_APP_DIR:-/root/playground-backend/backend}"
DUMP_FILE="/tmp/playground_dump_$(date +%Y%m%d_%H%M%S).sql"

if [ -z "$RENDER_DATABASE_URL" ]; then
  echo "❌ Erro: RENDER_DATABASE_URL não definida."
  echo "   export RENDER_DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
  exit 1
fi

if ! command -v pg_dump &>/dev/null; then
  echo "❌ pg_dump não encontrado. Instale: sudo apt install postgresql-client"
  exit 1
fi

echo "======================================"
echo " Migração Render.com → $DEST_HOST"
echo "======================================"

echo "[1/4] Gerando dump..."
pg_dump --no-owner --no-privileges --format=plain --encoding=UTF8 "$RENDER_DATABASE_URL" > "$DUMP_FILE"
echo "      Dump gerado: $(du -h "$DUMP_FILE" | cut -f1)"

echo "[2/4] Copiando para o servidor..."
scp -P "$DEST_PORT" "$DUMP_FILE" "$DEST_USER@$DEST_HOST:/tmp/playground_dump.sql"

echo "[3/4] Restaurando banco..."
POSTGRES_USER=$(ssh -p "$DEST_PORT" "$DEST_USER@$DEST_HOST" "grep '^POSTGRES_USER=' $DEST_APP_DIR/.env | cut -d= -f2")
POSTGRES_DB=$(ssh -p "$DEST_PORT" "$DEST_USER@$DEST_HOST" "grep '^POSTGRES_DB=' $DEST_APP_DIR/.env | cut -d= -f2")
POSTGRES_USER="${POSTGRES_USER:-playground}"
POSTGRES_DB="${POSTGRES_DB:-playground}"

ssh -p "$DEST_PORT" "$DEST_USER@$DEST_HOST" bash << EOF
set -e
cd $DEST_APP_DIR
docker compose -f docker-compose.prod.yml exec -T postgres psql -U $POSTGRES_USER -c "DROP DATABASE IF EXISTS ${POSTGRES_DB}_backup;"
docker compose -f docker-compose.prod.yml exec -T postgres psql -U $POSTGRES_USER -c "ALTER DATABASE $POSTGRES_DB RENAME TO ${POSTGRES_DB}_backup;" 2>/dev/null || true
docker compose -f docker-compose.prod.yml exec -T postgres psql -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB;"
cat /tmp/playground_dump.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
rm -f /tmp/playground_dump.sql
EOF

echo "[4/4] Rodando migrations Prisma..."
ssh -p "$DEST_PORT" "$DEST_USER@$DEST_HOST" "cd $DEST_APP_DIR && docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy"

rm -f "$DUMP_FILE"
echo "======================================"
echo " Migração concluída!"
echo "======================================"
echo "  !! Backup disponível em: ${POSTGRES_DB}_backup"
echo "     Para remover após validar:"
echo "     docker compose exec postgres psql -U $POSTGRES_USER -c 'DROP DATABASE ${POSTGRES_DB}_backup;'"
