# 🐳 Troubleshooting Docker

## Erro: "failed to read dockerfile: open Dockerfile: no such file or directory"

### Causa
O comando `docker compose` está sendo executado do diretório errado.

### Solução

**IMPORTANTE**: Sempre execute os comandos Docker de dentro do diretório `backend/`:

```bash
# 1. Entre no diretório backend
cd backend

# 2. Agora execute o docker compose
docker compose up
# ou
docker compose build
```

### Verificação

Para verificar se está no diretório correto:

```bash
# Verificar diretório atual
pwd
# Deve mostrar: .../playground-backend/backend

# Verificar se os arquivos existem
ls -la | grep Dockerfile
# Deve mostrar: Dockerfile e Dockerfile.dev
```

## Comandos Corretos

### Desenvolvimento

```bash
cd backend
docker compose up
# ou
docker compose up --build
```

### Produção

```bash
cd backend
docker compose -f docker-compose.prod.yml up
# ou
docker compose -f docker-compose.prod.yml up --build
```

## Estrutura de Arquivos

```
playground-backend/
├── backend/                    ← Execute comandos aqui
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── ...
└── ...
```

## Outros Erros Comuns

### Erro: "context not found"
- **Causa**: Contexto do build está incorreto
- **Solução**: Execute de dentro do diretório `backend/`

### Erro: "Cannot find module"
- **Causa**: Dependências não instaladas no container
- **Solução**: Reconstrua a imagem: `docker compose build --no-cache`

### Erro: "Permission denied"
- **Causa**: Permissões de arquivo
- **Solução**: 
  ```bash
  chmod +x scripts/*.sh
  ```

### Erro: "Port already in use"
- **Causa**: Porta 3001 já está em uso
- **Solução**: 
  ```bash
  # Parar container existente
  docker compose down
  
  # Ou mudar a porta no docker-compose.yml
  ```

## Scripts Úteis

Crie um alias ou script para facilitar:

```bash
# Adicionar ao ~/.zshrc ou ~/.bashrc
alias playground-up="cd ~/Documents/playground-app/playground-backend/backend && docker compose up"
alias playground-down="cd ~/Documents/playground-app/playground-backend/backend && docker compose down"
alias playground-build="cd ~/Documents/playground-app/playground-backend/backend && docker compose build"
```

## Checklist

Antes de executar `docker compose`:

- [ ] Estou no diretório `backend/`
- [ ] Arquivo `Dockerfile.dev` existe
- [ ] Arquivo `docker-compose.yml` existe
- [ ] Arquivo `.env` existe (ou `env.example` está disponível)
- [ ] Docker está rodando (`docker ps` funciona)

