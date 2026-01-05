import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { AppError } from './errorHandler'

type PermissionKey = 
  | 'acompanhamento'
  | 'lancamento'
  | 'caixaAbertura'
  | 'caixaFechamento'
  | 'caixaSangria'
  | 'caixaSuprimento'
  | 'estacionamentoCadastro'
  | 'estacionamentoCaixaAbertura'
  | 'estacionamentoCaixaFechamento'
  | 'estacionamentoLancamento'
  | 'estacionamentoAcompanhamento'
  | 'relatorios'
  | 'parametrosEmpresa'
  | 'parametrosFormasPagamento'
  | 'parametrosBrinquedos'
  | 'clientes'

function checkPermission(permissoes: NonNullable<AuthRequest['user']>['permissoes'], permission: PermissionKey): boolean {
  if (!permissoes) return false

  // Permissões simples
  if (permission === 'acompanhamento') return permissoes.acompanhamento === true
  if (permission === 'lancamento') return permissoes.lancamento === true
  if (permission === 'relatorios') return permissoes.relatorios === true
  if (permission === 'clientes') return permissoes.clientes === true

  // Permissões de caixa
  if (permission === 'caixaAbertura') return permissoes.caixa?.abertura === true
  if (permission === 'caixaFechamento') return permissoes.caixa?.fechamento === true
  if (permission === 'caixaSangria') return permissoes.caixa?.sangria === true
  if (permission === 'caixaSuprimento') return permissoes.caixa?.suprimento === true

  // Permissões de estacionamento
  if (permission === 'estacionamentoCadastro') return permissoes.estacionamento?.cadastro === true
  if (permission === 'estacionamentoCaixaAbertura') return permissoes.estacionamento?.caixa?.abertura === true
  if (permission === 'estacionamentoCaixaFechamento') return permissoes.estacionamento?.caixa?.fechamento === true
  if (permission === 'estacionamentoLancamento') return permissoes.estacionamento?.lancamento === true
  if (permission === 'estacionamentoAcompanhamento') return permissoes.estacionamento?.acompanhamento === true

  // Permissões de parâmetros
  if (permission === 'parametrosEmpresa') return permissoes.parametros?.empresa === true
  if (permission === 'parametrosFormasPagamento') return permissoes.parametros?.formasPagamento === true
  if (permission === 'parametrosBrinquedos') return permissoes.parametros?.brinquedos === true

  return false
}

export function requirePermission(permission: PermissionKey) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Usuário não autenticado')
    }

    const hasPermission = checkPermission(req.user.permissoes, permission)

    if (!hasPermission) {
      throw new AppError(403, `Permissão negada: ${permission}`)
    }

    next()
  }
}

