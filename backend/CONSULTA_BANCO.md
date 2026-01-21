# 📊 Como Consultar as Tabelas do Banco de Dados

Este guia mostra diferentes formas de consultar e visualizar os dados do banco PostgreSQL.

## 🎨 Opção 1: Prisma Studio (Recomendado - Interface Gráfica)

A forma mais fácil e visual de consultar o banco:

```bash
# No diretório do backend
cd playground-backend/backend

# Certifique-se de que as dependências estão instaladas
npm install

# Iniciar Prisma Studio
npm run prisma:studio

# OU usar npx diretamente (se npm run não funcionar)
npx prisma studio
```

O Prisma Studio abrirá automaticamente no navegador em `http://localhost:5555`

**Se der erro "command not found":**
1. Verifique se `node_modules` existe: `ls node_modules`
2. Se não existir, instale as dependências: `npm install`
3. Tente novamente: `npx prisma studio`

**Vantagens:**
- ✅ Interface gráfica intuitiva
- ✅ Visualiza todas as tabelas
- ✅ Permite editar dados diretamente
- ✅ Filtros e buscas fáceis
- ✅ Relacionamentos visíveis

## 💻 Opção 2: Script Node.js com Prisma Client

Crie um script para consultas personalizadas:

```typescript
// scripts/consultar-banco.ts
import { prisma } from '../src/lib/prisma'

async function consultar() {
  // Consultar todas as tabelas
  const caixas = await prisma.caixa.findMany()
  const lancamentos = await prisma.lancamento.findMany()
  const clientes = await prisma.cliente.findMany()
  const brinquedos = await prisma.brinquedo.findMany()
  const formasPagamento = await prisma.formaPagamento.findMany()
  const usuarios = await prisma.usuario.findMany()
  const estacionamentos = await prisma.estacionamento.findMany()
  
  console.log('=== CAIXAS ===')
  console.log(JSON.stringify(caixas, null, 2))
  
  console.log('\n=== LANÇAMENTOS ===')
  console.log(JSON.stringify(lancamentos, null, 2))
  
  console.log('\n=== CLIENTES ===')
  console.log(JSON.stringify(clientes, null, 2))
  
  // Consultas específicas
  const caixaAberto = await prisma.caixa.findFirst({
    where: { status: 'aberto' },
    include: { movimentos: true }
  })
  
  console.log('\n=== CAIXA ABERTO ===')
  console.log(JSON.stringify(caixaAberto, null, 2))
  
  await prisma.$disconnect()
}

consultar().catch(console.error)
```

Execute com:
```bash
tsx scripts/consultar-banco.ts
```

## 🗄️ Opção 3: PostgreSQL CLI (psql)

Conecte diretamente ao banco PostgreSQL:

```bash
# Se estiver usando Docker
docker exec -it playground-backend-postgres-1 psql -U playground -d playground

# Ou se tiver psql instalado localmente
psql postgresql://playground:playground123@localhost:5432/playground
```

Comandos úteis no psql:
```sql
-- Listar todas as tabelas
\dt

-- Descrever estrutura de uma tabela
\d caixas
\d lancamentos

-- Consultar dados
SELECT * FROM "Caixa";
SELECT * FROM "Lancamento" LIMIT 10;
SELECT * FROM "Caixa" WHERE status = 'aberto';

-- Contar registros
SELECT COUNT(*) FROM "Lancamento";
SELECT COUNT(*) FROM "Caixa" WHERE status = 'aberto';

-- Sair do psql
\q
```

## 🐳 Opção 4: Docker Exec (se usando Docker)

```bash
# Entrar no container do PostgreSQL
docker exec -it playground-backend-postgres-1 bash

# Dentro do container, conectar ao banco
psql -U playground -d playground

# Ou executar comando direto
docker exec -it playground-backend-postgres-1 psql -U playground -d playground -c "SELECT * FROM \"Caixa\";"
```

## 🔍 Opção 5: Ferramentas GUI (DBeaver, pgAdmin, TablePlus)

### DBeaver (Gratuito e Open Source)
1. Baixe em: https://dbeaver.io/
2. Crie nova conexão PostgreSQL
3. Configure:
   - Host: `localhost`
   - Port: `5432`
   - Database: `playground`
   - User: `playground`
   - Password: `playground123`

### pgAdmin (Oficial do PostgreSQL)
1. Baixe em: https://www.pgadmin.org/
2. Adicione novo servidor
3. Configure as mesmas credenciais acima

### TablePlus (macOS/Windows - Pago, mas tem versão gratuita)
1. Baixe em: https://tableplus.com/
2. Crie nova conexão PostgreSQL
3. Configure as credenciais

## 📝 Exemplos de Consultas Úteis

### Via Prisma Client (TypeScript)

```typescript
// Caixas abertos
const caixasAbertos = await prisma.caixa.findMany({
  where: { status: 'aberto' },
  include: { movimentos: true }
})

// Lançamentos do dia
const hoje = new Date()
hoje.setHours(0, 0, 0, 0)
const lancamentosHoje = await prisma.lancamento.findMany({
  where: {
    dataHora: { gte: hoje }
  },
  include: {
    brinquedo: true,
    cliente: true,
    formaPagamento: true
  }
})

// Total de vendas do dia
const vendasHoje = await prisma.lancamento.aggregate({
  where: {
    status: 'pago',
    dataHora: { gte: hoje }
  },
  _sum: {
    valorCalculado: true
  }
})

// Top 5 brinquedos mais usados
const topBrinquedos = await prisma.lancamento.groupBy({
  by: ['brinquedoId'],
  _count: { id: true },
  orderBy: { _count: { id: 'desc' } },
  take: 5
})
```

### Via SQL Direto

```sql
-- Caixas abertos
SELECT * FROM "Caixa" WHERE status = 'aberto';

-- Lançamentos do dia
SELECT * FROM "Lancamento" 
WHERE DATE("dataHora") = CURRENT_DATE;

-- Total de vendas do dia
SELECT SUM("valorCalculado") as total
FROM "Lancamento"
WHERE status = 'pago' 
AND DATE("dataHora") = CURRENT_DATE;

-- Top 5 brinquedos mais usados
SELECT 
  b.nome,
  COUNT(l.id) as total_uso
FROM "Lancamento" l
JOIN "Brinquedo" b ON l."brinquedoId" = b.id
GROUP BY b.id, b.nome
ORDER BY total_uso DESC
LIMIT 5;
```

## 🚀 Quick Start

**A forma mais rápida para começar:**

### 1. Configure o arquivo .env

Se você está usando Docker (como mostrado pelos containers rodando), crie o arquivo `.env`:

```bash
cd playground-backend/backend
cp env.example .env
```

Edite o `.env` e configure a `DATABASE_URL` para acessar o PostgreSQL do Docker:

```env
DATABASE_URL="postgresql://playground:playground123@localhost:5432/playground?schema=public"
```

**Importante:** 
- Use `localhost` (não `postgres`) quando acessar de FORA do Docker
- Use `postgres` apenas quando estiver DENTRO do container Docker

### 2. Inicie o Prisma Studio

```bash
npm run prisma:studio
```

Isso abrirá uma interface web onde você pode ver e editar todas as tabelas facilmente!

### 3. Se der erro "DATABASE_URL not found"

Certifique-se de que:
- ✅ O arquivo `.env` existe no diretório `backend/`
- ✅ A variável `DATABASE_URL` está configurada corretamente
- ✅ O container PostgreSQL está rodando: `docker ps | grep postgres`

## 📚 Documentação

- Prisma Studio: https://www.prisma.io/studio
- Prisma Query API: https://www.prisma.io/docs/concepts/components/prisma-client
- PostgreSQL Docs: https://www.postgresql.org/docs/
