# 🚀 Guia Rápido de Setup

## Passo a Passo

1. **Instale as dependências:**
```bash
cd backend
npm install
```

2. **Configure o arquivo .env:**
```bash
cp env.example .env
```

Edite o `.env` e defina:
- `JWT_SECRET` - Uma string aleatória forte (ex: `openssl rand -base64 32`)
- `PORT` - Porta do servidor (padrão: 3001)
- `DATABASE_URL` - URL do banco (SQLite por padrão: `file:./dev.db`)

3. **Configure o banco de dados:**
```bash
# Gera o cliente Prisma
npm run prisma:generate

# Cria as tabelas no banco
npm run prisma:migrate

# Popula com dados iniciais (cria usuário admin)
npm run prisma:seed
```

4. **Inicie o servidor:**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

## 🔑 Credenciais Padrão

Após executar o seed:
- **Apelido:** `admin`
- **Senha:** `admin`

⚠️ **Altere a senha em produção!**

## 📝 Testando a API

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 🗄️ Prisma Studio

Para visualizar/editar dados:
```bash
npm run prisma:studio
```

Abre em `http://localhost:5555`

