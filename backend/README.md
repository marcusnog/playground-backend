# Backend - Sistema de Gestão de Playground

Backend API REST desenvolvido com Node.js, Express, TypeScript e Prisma ORM.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados (pode ser facilmente migrado para PostgreSQL)
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

**OU**

- Docker e Docker Compose instalados

## 🐳 Executando com Docker (Recomendado)

A forma mais rápida de executar o backend é usando Docker:

```bash
# Opção 1: Script automatizado (mais fácil)
./docker-start.sh

# Opção 2: Docker Compose (versão moderna)
docker compose up -d --build
docker compose exec backend npm run prisma:seed

# Opção 3: Docker Compose (versão antiga)
docker-compose up -d --build
docker-compose exec backend npm run prisma:seed

# Opção 4: Make
make up-build
make seed
```

📚 **Documentação:**
- [QUICKSTART.md](./QUICKSTART.md) - Guia rápido
- [DOCKER.md](./DOCKER.md) - Documentação completa
- [docker-compose.README.md](./docker-compose.README.md) - Guia específico do Docker Compose

## 🔧 Instalação (Sem Docker)

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
- `PORT` - Porta do servidor (padrão: 3001)
- `JWT_SECRET` - Chave secreta para JWT (use uma string forte em produção)
- `DATABASE_URL` - URL do banco de dados (SQLite por padrão)

3. Gere o cliente Prisma:
```bash
npm run prisma:generate
```

4. Execute as migrações do banco de dados:
```bash
npm run prisma:migrate
```

5. Execute o seed para criar dados iniciais:
```bash
npm run prisma:seed
```

## 🏃 Executando

### Desenvolvimento
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Produção
```bash
npm run build
npm start
```

## 📚 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual

### Formas de Pagamento
- `GET /api/formas-pagamento` - Listar
- `GET /api/formas-pagamento/:id` - Obter por ID
- `POST /api/formas-pagamento` - Criar
- `PUT /api/formas-pagamento/:id` - Atualizar
- `DELETE /api/formas-pagamento/:id` - Deletar

### Brinquedos
- `GET /api/brinquedos` - Listar
- `GET /api/brinquedos/:id` - Obter por ID
- `POST /api/brinquedos` - Criar
- `PUT /api/brinquedos/:id` - Atualizar
- `DELETE /api/brinquedos/:id` - Deletar

### Parâmetros
- `GET /api/parametros` - Obter parâmetros globais
- `PUT /api/parametros` - Atualizar parâmetros

### Caixas
- `GET /api/caixas` - Listar todos
- `GET /api/caixas/aberto` - Obter caixa aberto
- `GET /api/caixas/:id` - Obter por ID
- `POST /api/caixas/abertura` - Abrir caixa
- `POST /api/caixas/fechamento` - Fechar caixa
- `POST /api/caixas/:id/sangria` - Realizar sangria
- `POST /api/caixas/:id/suprimento` - Realizar suprimento
- `GET /api/caixas/:id/movimentos` - Listar movimentos

### Clientes
- `GET /api/clientes` - Listar
- `GET /api/clientes/:id` - Obter por ID
- `GET /api/clientes/search/:query` - Buscar
- `POST /api/clientes` - Criar
- `PUT /api/clientes/:id` - Atualizar
- `DELETE /api/clientes/:id` - Deletar

### Usuários
- `GET /api/usuarios` - Listar
- `GET /api/usuarios/:id` - Obter por ID
- `POST /api/usuarios` - Criar
- `PUT /api/usuarios/:id` - Atualizar
- `DELETE /api/usuarios/:id` - Deletar

### Lançamentos
- `GET /api/lancamentos` - Listar (query params: status, data)
- `GET /api/lancamentos/abertos` - Listar abertos
- `GET /api/lancamentos/:id` - Obter por ID
- `POST /api/lancamentos` - Criar
- `PUT /api/lancamentos/:id` - Atualizar
- `POST /api/lancamentos/:id/pagar` - Pagar lançamento
- `POST /api/lancamentos/:id/cancelar` - Cancelar lançamento

### Estacionamentos
- `GET /api/estacionamentos` - Listar
- `GET /api/estacionamentos/:id` - Obter por ID
- `POST /api/estacionamentos` - Criar
- `PUT /api/estacionamentos/:id` - Atualizar
- `DELETE /api/estacionamentos/:id` - Deletar

### Lançamentos de Estacionamento
- `GET /api/estacionamentos/lancamentos` - Listar (query params: status, data, estacionamentoId)
- `GET /api/estacionamentos/lancamentos/abertos` - Listar abertos
- `GET /api/estacionamentos/lancamentos/:id` - Obter por ID
- `POST /api/estacionamentos/lancamentos` - Criar
- `POST /api/estacionamentos/lancamentos/:id/pagar` - Pagar
- `POST /api/estacionamentos/lancamentos/:id/cancelar` - Cancelar

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT. Envie o token no header:
```
Authorization: Bearer <token>
```

## 🔑 Usuário Padrão

Após executar o seed, você pode fazer login com:
- **Apelido:** `admin`
- **Senha:** `admin`

⚠️ **IMPORTANTE:** Altere a senha do admin em produção!

## 🗄️ Banco de Dados

### SQLite (Padrão)
O banco de dados SQLite será criado automaticamente em `prisma/dev.db` após executar as migrações.

### Migrar para PostgreSQL
1. Altere o `provider` no `schema.prisma` para `postgresql`
2. Atualize a `DATABASE_URL` no `.env`
3. Execute `npm run prisma:migrate`

### Prisma Studio
Para visualizar e editar dados diretamente:
```bash
npm run prisma:studio
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor em produção
- `npm run prisma:generate` - Gera cliente Prisma
- `npm run prisma:migrate` - Executa migrações
- `npm run prisma:studio` - Abre Prisma Studio
- `npm run prisma:seed` - Executa seed do banco

## 🛠️ Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/    # Controllers das rotas
│   ├── routes/         # Definição das rotas
│   ├── middleware/     # Middlewares (auth, permissions, error)
│   ├── lib/            # Bibliotecas (Prisma client)
│   └── server.ts       # Arquivo principal
├── prisma/
│   ├── schema.prisma   # Schema do banco de dados
│   └── seed.ts         # Seed do banco
├── package.json
└── tsconfig.json
```

## 🔒 Permissões

O sistema possui um sistema de permissões granular. Cada usuário pode ter permissões específicas para:
- Acompanhamento
- Lançamento
- Operações de caixa (abertura, fechamento, sangria, suprimento)
- Estacionamento (cadastro, caixa, lançamento, acompanhamento)
- Relatórios
- Parâmetros (empresa, formas de pagamento, brinquedos)
- Clientes

## 🐛 Troubleshooting

### Erro ao executar migrações
Certifique-se de que o Prisma Client foi gerado:
```bash
npm run prisma:generate
```

### Erro de autenticação
Verifique se o `JWT_SECRET` está configurado no `.env`

### Banco de dados não encontrado
Execute as migrações:
```bash
npm run prisma:migrate
```

