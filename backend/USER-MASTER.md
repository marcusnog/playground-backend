# 👤 Usuário Master

Este documento explica como criar e gerenciar o usuário master do sistema.

## 🔐 Usuário Master Padrão

O seed do banco de dados cria automaticamente um usuário master com todas as permissões:

- **Apelido**: `master`
- **Senha padrão**: `master123` (ou definida via `MASTER_PASSWORD`)
- **Permissões**: Todas as permissões habilitadas

## 📝 Como Criar/Atualizar o Usuário Master

### Opção 1: Via Seed (Automático)

O seed cria automaticamente o usuário master:

```bash
npm run prisma:seed
```

### Opção 2: Via Script

Use o script dedicado:

```bash
# Com valores padrão (apelido: master, senha: master123)
npm run create:master

# Com valores customizados
./scripts/create-master.sh master minha-senha-segura "Nome Completo"
```

### Opção 3: Via API (Após Login)

Após fazer login com um usuário que tenha permissão de criar usuários:

```bash
# 1. Fazer login
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"master","password":"master123"}' | jq -r '.token')

# 2. Criar novo usuário master
curl -X POST http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Usuário Master",
    "apelido": "master",
    "senha": "nova-senha-segura",
    "contato": "master@playground.com",
    "acompanhamento": true,
    "lancamento": true,
    "caixaAbertura": true,
    "caixaFechamento": true,
    "caixaSangria": true,
    "caixaSuprimento": true,
    "estacionamentoCadastro": true,
    "estacionamentoCaixaAbertura": true,
    "estacionamentoCaixaFechamento": true,
    "estacionamentoLancamento": true,
    "estacionamentoAcompanhamento": true,
    "relatorios": true,
    "parametrosEmpresa": true,
    "parametrosFormasPagamento": true,
    "parametrosBrinquedos": true,
    "clientes": true
  }'
```

## 🚀 No Render (Produção)

### Após o Deploy

1. **Execute o seed via Render Shell:**
   - Vá para o Web Service no Render
   - Clique em **"Shell"**
   - Execute:
     ```bash
     npm run prisma:seed
     ```

2. **Ou via script:**
   ```bash
   npm run create:master master sua-senha-segura "Usuário Master"
   ```

### Variáveis de Ambiente (Opcional)

Você pode definir a senha do master via variável de ambiente:

```env
MASTER_PASSWORD=sua-senha-super-segura
ADMIN_PASSWORD=senha-admin
```

O seed usará essas variáveis se estiverem configuradas.

## 🔒 Segurança

### ⚠️ IMPORTANTE

1. **Altere a senha padrão em produção!**
   - A senha padrão `master123` é apenas para desenvolvimento
   - Use uma senha forte em produção

2. **Não commite senhas no código**
   - Use variáveis de ambiente
   - Use o script para criar usuários em produção

3. **Rotacione senhas periodicamente**
   - Mude a senha do master regularmente
   - Use senhas com pelo menos 12 caracteres

## 📋 Permissões do Usuário Master

O usuário master tem **todas** as permissões habilitadas:

- ✅ Acompanhamento
- ✅ Lançamento
- ✅ Caixa (abertura, fechamento, sangria, suprimento)
- ✅ Estacionamento (cadastro, caixa, lançamento, acompanhamento)
- ✅ Relatórios
- ✅ Parâmetros (empresa, formas de pagamento, brinquedos)
- ✅ Clientes

## 🔍 Verificar Usuário Master

```bash
# Fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"master","password":"master123"}'

# Verificar permissões
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🛠️ Troubleshooting

### Erro: "Usuário não encontrado"

Execute o seed:
```bash
npm run prisma:seed
```

### Erro: "Credenciais inválidas"

Verifique se a senha está correta. Se esqueceu, recrie o usuário:
```bash
npm run create:master master nova-senha "Usuário Master"
```

### Erro: "Permissão negada"

Certifique-se de que o usuário tem todas as permissões habilitadas.

## 📚 Comandos Úteis

```bash
# Criar usuário master
npm run create:master

# Executar seed completo (cria master + dados iniciais)
npm run prisma:seed

# Ver usuários no banco
npm run prisma:studio
```

