.PHONY: help build up down logs shell seed migrate studio clean

help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Detectar docker compose ou docker-compose
DOCKER_COMPOSE := $(shell which docker-compose 2>/dev/null || echo "docker compose")

build: ## Constrói a imagem Docker
	$(DOCKER_COMPOSE) build

up: ## Inicia os containers
	$(DOCKER_COMPOSE) up -d

up-build: ## Inicia os containers com rebuild
	$(DOCKER_COMPOSE) up -d --build

down: ## Para e remove os containers
	$(DOCKER_COMPOSE) down

logs: ## Mostra os logs do backend
	$(DOCKER_COMPOSE) logs -f backend

shell: ## Abre um shell no container
	$(DOCKER_COMPOSE) exec backend sh

seed: ## Executa o seed do banco de dados
	$(DOCKER_COMPOSE) exec backend npm run prisma:seed

migrate: ## Executa as migrações
	$(DOCKER_COMPOSE) exec backend npm run prisma:migrate

studio: ## Abre o Prisma Studio
	$(DOCKER_COMPOSE) exec backend npm run prisma:studio

clean: ## Remove containers, volumes e imagens
	$(DOCKER_COMPOSE) down -v --rmi all

restart: ## Reinicia os containers
	$(DOCKER_COMPOSE) restart

ps: ## Mostra status dos containers
	$(DOCKER_COMPOSE) ps

prod-up: ## Inicia em modo produção
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d

prod-down: ## Para em modo produção
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml down

prod-logs: ## Logs em modo produção
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml logs -f

