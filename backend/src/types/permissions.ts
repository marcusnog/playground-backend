export type PermissoesModulo = {
  acompanhamento?: boolean
  lancamento?: boolean
  caixa?: {
    abertura?: boolean
    fechamento?: boolean
    sangria?: boolean
    suprimento?: boolean
  }
  estacionamento?: {
    cadastro?: boolean
    caixa?: {
      abertura?: boolean
      fechamento?: boolean
    }
    lancamento?: boolean
    acompanhamento?: boolean
  }
  relatorios?: boolean
  parametros?: {
    empresa?: boolean
    formasPagamento?: boolean
    brinquedos?: boolean
  }
  clientes?: boolean
}

