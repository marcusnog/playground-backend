# 🔄 Migração para PostgreSQL

O schema do Prisma foi atualizado para usar PostgreSQL, que é necessário para deploy no Render.

## 📋 O que mudou

- `provider = "sqlite"` → `provider = "postgresql"`

## 🔧 Configuração Local (Desenvolvimento)

Se você quiser continuar usando SQLite localmente, você tem duas opções:

### Opção 1: Usar PostgreSQL Localmente (Recomendado)

1. Instale PostgreSQL:
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14
   
   # Linux
   sudo apt-get install postgresql
   ```

2. Crie o banco:
   ```bash
   createdb playground
   ```

3. Configure o `.env`:
   ```env
   DATABASE_URL="postgresql://seu-usuario@localhost:5432/playground?schema=public"
   ```

4. Execute as migrações:
   ```bash
   npm run prisma:migrate
   ```

### Opção 2: Continuar com SQLite (Temporário)

Se precisar usar SQLite temporariamente:

1. Crie um arquivo `schema.prisma.local` com SQLite
2. Ou reverta temporariamente o provider no schema
3. **Mas lembre-se**: você precisará mudar para PostgreSQL antes de fazer deploy

## 🚀 Render (Produção)

O Render já está configurado para PostgreSQL. Após configurar a `DATABASE_URL` do PostgreSQL no Render, tudo funcionará automaticamente.

## 📝 Próximos Passos

1. **Commit a mudança do schema:**
   ```bash
   git add backend/prisma/schema.prisma
   git commit -m "Change Prisma provider to PostgreSQL for Render deployment"
   git push
   ```

2. **No Render:**
   - Certifique-se de que a `DATABASE_URL` está configurada com a URL do PostgreSQL
   - Faça um novo deploy

3. **Execute as migrações:**
   - As migrações serão executadas automaticamente pelo Dockerfile
   - Ou execute manualmente: `npm run prisma:migrate:deploy`

## ⚠️ Importante

- O schema agora usa PostgreSQL
- Todas as migrações precisam ser executadas no PostgreSQL
- O banco SQLite local não funcionará mais sem mudanças
- Para desenvolvimento local, configure PostgreSQL ou ajuste o schema temporariamente

## 🔄 Reverter para SQLite (se necessário)

Se precisar voltar para SQLite temporariamente:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Mas lembre-se de mudar de volta para PostgreSQL antes de fazer deploy no Render!

