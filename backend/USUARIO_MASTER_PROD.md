# 👤 Usuário Master em Produção

Este documento explica como o usuário master é configurado automaticamente em produção.

## 🔐 Usuário Master Automático

O sistema **cria automaticamente** um usuário master toda vez que o servidor inicia em produção.

### Credenciais Padrão

- **Apelido**: `master`
- **Senha padrão**: `master123` (ou definida via `MASTER_PASSWORD`)
- **Permissões**: Todas as permissões habilitadas

## 🚀 Como Funciona

### No Dockerfile (Produção)

O Dockerfile executa automaticamente:

1. **Migrações**: `npx prisma migrate deploy`
2. **Seed**: `npx tsx prisma/seed.ts` (cria/atualiza usuário master)
3. **Servidor**: `node dist/server.js`

Isso garante que **sempre** haverá um usuário master disponível após cada deploy.

### Comportamento do Seed

O seed usa `upsert`, o que significa:
- ✅ Se o usuário master **não existe**: cria um novo
- ✅ Se o usuário master **já existe**: atualiza para garantir todas as permissões
- ✅ **Sempre** garante que o master tenha todas as permissões habilitadas

## 🔧 Configuração Personalizada

### Alterar Senha do Master

Você pode definir uma senha personalizada via variável de ambiente no Render:

```env
MASTER_PASSWORD=sua-senha-super-segura-aqui
```

**Importante**: Se não definir `MASTER_PASSWORD`, a senha padrão será `master123`.

### Alterar Apelido

Por padrão, o apelido é `master`. Para alterar, você precisaria modificar o `prisma/seed.ts`.

## 📝 Uso em Produção

### Login

```bash
# Via API
curl -X POST https://seu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"master","password":"master123"}'
```

### Via Frontend

1. Acesse a página de login
2. Use:
   - **Usuário**: `master`
   - **Senha**: `master123` (ou a senha definida em `MASTER_PASSWORD`)

## 🔒 Segurança

### ⚠️ Recomendações

1. **Altere a senha após o primeiro login**
   - Use uma senha forte e única
   - Não compartilhe a senha do master

2. **Configure `MASTER_PASSWORD` no Render**
   - Use uma senha forte (mínimo 12 caracteres)
   - Não use a senha padrão em produção real

3. **Monitore o uso do usuário master**
   - Use apenas para testes e configuração inicial
   - Crie usuários específicos para operação diária

### Boas Práticas

- ✅ Use o master apenas para configuração inicial
- ✅ Crie usuários específicos para cada operador
- ✅ Rotacione a senha periodicamente
- ✅ Monitore logs de acesso do usuário master

## 🐛 Troubleshooting

### Usuário master não existe

**Causa**: Seed não foi executado ou falhou.

**Solução**: 
1. Verifique os logs do deploy no Render
2. Execute manualmente via Shell do Render:
   ```bash
   npx tsx prisma/seed.ts
   ```

### Senha não funciona

**Causa**: Senha foi alterada ou `MASTER_PASSWORD` está configurada diferente.

**Solução**:
1. Verifique a variável `MASTER_PASSWORD` no Render
2. Ou recrie o usuário via Shell:
   ```bash
   npm run create:master master nova-senha "Usuário Master"
   ```

### Permissões não funcionam

**Causa**: Seed não atualizou as permissões.

**Solução**: Execute o seed novamente (ele atualiza automaticamente):
```bash
npx tsx prisma/seed.ts
```

## 📚 Referências

- [USER-MASTER.md](./USER-MASTER.md) - Documentação completa do usuário master
- [prisma/seed.ts](./prisma/seed.ts) - Código do seed
