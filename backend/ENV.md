# 🔧 Variáveis de Ambiente

Este documento descreve todas as variáveis de ambiente utilizadas no projeto.

## 📋 Variáveis Obrigatórias

Estas variáveis **devem** estar configuradas para a aplicação funcionar:

### `JWT_SECRET`
- **Tipo**: String
- **Obrigatória**: ✅ Sim
- **Descrição**: Chave secreta usada para assinar e verificar tokens JWT
- **Recomendações**:
  - Mínimo de 32 caracteres em produção
  - Use uma string aleatória forte
  - **NUNCA** use o valor padrão em produção
- **Como gerar**:
  ```bash
  openssl rand -base64 32
  ```
- **Exemplo**:
  ```env
  JWT_SECRET=K8j3mN9pQ2rT5vW8xY1zA4bC6dE7fG9hI0jK2lM3nO4pQ5rS6tU7vW8xY9z
  ```

### `DATABASE_URL`
- **Tipo**: String (URL)
- **Obrigatória**: ✅ Sim
- **Descrição**: URL de conexão com o banco de dados
- **Formatos suportados**:
  - SQLite (desenvolvimento)
  - PostgreSQL (produção recomendado)
- **Exemplos**:
  ```env
  # SQLite
  DATABASE_URL="file:./data/dev.db"
  
  # PostgreSQL
  DATABASE_URL="postgresql://usuario:senha@localhost:5432/playground?schema=public"
  
  # PostgreSQL (com SSL)
  DATABASE_URL="postgresql://usuario:senha@host:5432/playground?schema=public&sslmode=require"
  ```

## 🔧 Variáveis Opcionais

Estas variáveis têm valores padrão, mas podem ser configuradas:

### `NODE_ENV`
- **Tipo**: String
- **Obrigatória**: ❌ Não
- **Valor padrão**: `development`
- **Valores aceitos**: `development` | `production`
- **Descrição**: Define o ambiente de execução da aplicação
- **Impacto**:
  - `development`: 
    - Logs detalhados
    - Stack traces completos em erros
    - CORS permite todas as origens (se `CORS_ORIGIN` não estiver definido)
    - Prisma Client em modo global (hot reload)
  - `production`:
    - Logs em formato JSON
    - Stack traces ocultos em erros
    - CORS restritivo (requer `CORS_ORIGIN`)
    - Validações mais rigorosas
- **Exemplo**:
  ```env
  NODE_ENV=production
  ```

### `PORT`
- **Tipo**: Number
- **Obrigatória**: ❌ Não
- **Valor padrão**: `3001`
- **Descrição**: Porta em que o servidor HTTP irá escutar
- **Exemplo**:
  ```env
  PORT=3001
  ```

### `CORS_ORIGIN`
- **Tipo**: String (separada por vírgula)
- **Obrigatória**: ❌ Não (mas **altamente recomendada** em produção)
- **Valor padrão**: Vazio
- **Descrição**: Origens permitidas para requisições CORS
- **Comportamento**:
  - **Desenvolvimento**: Se vazio, permite todas as origens
  - **Produção**: Se vazio, **rejeita todas as requisições** (segurança)
- **Formato**: Múltiplas origens separadas por vírgula
- **Exemplos**:
  ```env
  # Uma origem
  CORS_ORIGIN=https://meusite.com
  
  # Múltiplas origens
  CORS_ORIGIN=https://meusite.com,https://www.meusite.com,https://app.meusite.com
  
  # Desenvolvimento (permite todas)
  CORS_ORIGIN=
  ```

## 📝 Arquivo `.env`

Crie um arquivo `.env` na raiz do diretório `backend/` com as variáveis:

```bash
# Copiar o arquivo de exemplo
cp env.example .env

# Editar o arquivo
nano .env  # ou use seu editor preferido
```

### Exemplo de `.env` para Desenvolvimento

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres
DATABASE_URL="file:./data/dev.db"
CORS_ORIGIN=
```

### Exemplo de `.env` para Produção

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=K8j3mN9pQ2rT5vW8xY1zA4bC6dE7fG9hI0jK2lM3nO4pQ5rS6tU7vW8xY9z
DATABASE_URL="postgresql://usuario:senha@host:5432/playground?schema=public"
CORS_ORIGIN=https://meusite.com,https://www.meusite.com
```

## 🔍 Validação

A aplicação valida automaticamente as variáveis de ambiente na inicialização:

### Verificar variáveis manualmente

```bash
npm run check-env
```

Este comando verifica:
- ✅ Variáveis obrigatórias presentes
- ✅ `JWT_SECRET` com tamanho adequado (em produção)
- ✅ `JWT_SECRET` não está usando valor padrão (em produção)
- ✅ `CORS_ORIGIN` configurado (em produção)

### Erros comuns

#### Erro: "Missing required environment variables"
- **Causa**: `JWT_SECRET` ou `DATABASE_URL` não estão configurados
- **Solução**: Configure ambas as variáveis no arquivo `.env`

#### Aviso: "JWT_SECRET should be at least 32 characters long"
- **Causa**: `JWT_SECRET` muito curto para produção
- **Solução**: Use uma chave com pelo menos 32 caracteres

#### Aviso: "JWT_SECRET is using the default value"
- **Causa**: `JWT_SECRET` ainda está com o valor padrão
- **Solução**: Gere uma nova chave usando `openssl rand -base64 32`

#### Aviso: "CORS_ORIGIN is not set"
- **Causa**: `CORS_ORIGIN` não configurado em produção
- **Solução**: Configure `CORS_ORIGIN` com as origens permitidas

## 🐳 Docker

### Docker Compose

O Docker Compose pode usar variáveis de ambiente de duas formas:

1. **Arquivo `.env`** (recomendado):
   ```yaml
   env_file:
     - .env
   ```

2. **Variáveis diretas**:
   ```yaml
   environment:
     - NODE_ENV=production
     - PORT=3001
   ```

### Dockerfile

As variáveis de ambiente devem ser passadas no momento da execução:

```bash
docker run -d \
  --name playground-backend \
  -p 3001:3001 \
  --env-file .env \
  playground-backend:latest
```

## ☁️ Plataformas Cloud

### Railway
Configure as variáveis na interface web ou via CLI:
```bash
railway variables set JWT_SECRET=sua-chave
railway variables set DATABASE_URL=sua-url
```

### Render
Configure em: **Environment** → **Environment Variables**

### Heroku
```bash
heroku config:set JWT_SECRET=sua-chave
heroku config:set DATABASE_URL=sua-url
```

### DigitalOcean App Platform
Configure em: **Settings** → **App-Level Environment Variables**

## 🔒 Segurança

### Checklist de Segurança

- [ ] `JWT_SECRET` com pelo menos 32 caracteres
- [ ] `JWT_SECRET` não é o valor padrão
- [ ] `JWT_SECRET` é único para cada ambiente
- [ ] `DATABASE_URL` usa credenciais fortes
- [ ] `CORS_ORIGIN` configurado em produção
- [ ] Arquivo `.env` está no `.gitignore`
- [ ] Variáveis sensíveis não estão commitadas

### Boas Práticas

1. **Nunca commite o arquivo `.env`**
   - Verifique se está no `.gitignore`
   - Use `env.example` como template

2. **Use valores diferentes por ambiente**
   - Desenvolvimento: valores de teste
   - Produção: valores seguros e únicos

3. **Rotacione `JWT_SECRET` periodicamente**
   - Isso invalida todos os tokens existentes
   - Planeje a migração antes de rotacionar

4. **Proteja `DATABASE_URL`**
   - Use credenciais fortes
   - Limite acesso ao banco por IP (quando possível)
   - Use SSL/TLS em produção

## 📊 Resumo

| Variável | Obrigatória | Padrão | Ambiente |
|----------|-------------|--------|----------|
| `JWT_SECRET` | ✅ Sim | - | Todos |
| `DATABASE_URL` | ✅ Sim | - | Todos |
| `NODE_ENV` | ❌ Não | `development` | Todos |
| `PORT` | ❌ Não | `3001` | Todos |
| `CORS_ORIGIN` | ⚠️ Recomendada | Vazio | Produção |

## 🆘 Suporte

Se tiver problemas com variáveis de ambiente:

1. Execute `npm run check-env`
2. Verifique se o arquivo `.env` existe
3. Verifique se as variáveis estão escritas corretamente
4. Verifique se não há espaços extras ou aspas incorretas
5. Reinicie o servidor após alterar variáveis

