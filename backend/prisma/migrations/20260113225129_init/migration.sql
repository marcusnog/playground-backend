-- CreateTable
CREATE TABLE "FormaPagamento" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pixChave" TEXT,
    "pixConta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormaPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brinquedo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "inicialMinutos" INTEGER,
    "valorInicial" DOUBLE PRECISION NOT NULL,
    "cicloMinutos" INTEGER,
    "valorCiclo" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brinquedo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parametros" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "valorInicialMinutos" INTEGER NOT NULL,
    "valorInicialReais" DOUBLE PRECISION NOT NULL,
    "valorCicloMinutos" INTEGER NOT NULL,
    "valorCicloReais" DOUBLE PRECISION NOT NULL,
    "empresaNome" TEXT,
    "empresaCnpj" TEXT,
    "empresaLogoUrl" TEXT,
    "pixChave" TEXT,
    "pixCidade" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parametros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caixa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "valorInicial" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentoCaixa" (
    "id" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentoCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "dataNascimento" TEXT NOT NULL,
    "nomePai" TEXT NOT NULL,
    "nomeMae" TEXT NOT NULL,
    "telefoneWhatsapp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lancamento" (
    "id" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "nomeCrianca" TEXT NOT NULL,
    "nomeResponsavel" TEXT NOT NULL,
    "tipoParente" TEXT,
    "whatsappResponsavel" TEXT NOT NULL,
    "numeroPulseira" TEXT,
    "tempoSolicitadoMin" INTEGER,
    "brinquedoId" TEXT,
    "clienteId" TEXT,
    "status" TEXT NOT NULL,
    "valorCalculado" DOUBLE PRECISION NOT NULL,
    "formaPagamentoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lancamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "apelido" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "usaCaixa" BOOLEAN NOT NULL DEFAULT false,
    "caixaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acompanhamento" BOOLEAN NOT NULL DEFAULT false,
    "lancamento" BOOLEAN NOT NULL DEFAULT false,
    "caixaAbertura" BOOLEAN NOT NULL DEFAULT false,
    "caixaFechamento" BOOLEAN NOT NULL DEFAULT false,
    "caixaSangria" BOOLEAN NOT NULL DEFAULT false,
    "caixaSuprimento" BOOLEAN NOT NULL DEFAULT false,
    "estacionamentoCadastro" BOOLEAN NOT NULL DEFAULT false,
    "estacionamentoCaixaAbertura" BOOLEAN NOT NULL DEFAULT false,
    "estacionamentoCaixaFechamento" BOOLEAN NOT NULL DEFAULT false,
    "estacionamentoLancamento" BOOLEAN NOT NULL DEFAULT false,
    "estacionamentoAcompanhamento" BOOLEAN NOT NULL DEFAULT false,
    "relatorios" BOOLEAN NOT NULL DEFAULT false,
    "parametrosEmpresa" BOOLEAN NOT NULL DEFAULT false,
    "parametrosFormasPagamento" BOOLEAN NOT NULL DEFAULT false,
    "parametrosBrinquedos" BOOLEAN NOT NULL DEFAULT false,
    "clientes" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estacionamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estacionamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LancamentoEstacionamento" (
    "id" TEXT NOT NULL,
    "estacionamentoId" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT,
    "telefoneContato" TEXT,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "formaPagamentoId" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LancamentoEstacionamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_apelido_key" ON "Usuario"("apelido");

-- AddForeignKey
ALTER TABLE "MovimentoCaixa" ADD CONSTRAINT "MovimentoCaixa_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_brinquedoId_fkey" FOREIGN KEY ("brinquedoId") REFERENCES "Brinquedo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "FormaPagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estacionamento" ADD CONSTRAINT "Estacionamento_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoEstacionamento" ADD CONSTRAINT "LancamentoEstacionamento_estacionamentoId_fkey" FOREIGN KEY ("estacionamentoId") REFERENCES "Estacionamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoEstacionamento" ADD CONSTRAINT "LancamentoEstacionamento_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "FormaPagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
