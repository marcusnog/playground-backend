CREATE TABLE "CaixaAbertura" (
    "id" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "usuarioAberturaId" TEXT NOT NULL,
    "usuarioFechamentoId" TEXT,
    "dataAbertura" TIMESTAMP(3) NOT NULL,
    "dataFechamento" TIMESTAMP(3),
    "valorInicial" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaixaAbertura_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "MovimentoCaixa"
ADD COLUMN IF NOT EXISTS "caixaAberturaId" TEXT;

ALTER TABLE "Lancamento"
ADD COLUMN IF NOT EXISTS "caixaAberturaId" TEXT;

ALTER TABLE "LancamentoEstacionamento"
ADD COLUMN IF NOT EXISTS "caixaAberturaId" TEXT;

CREATE INDEX "CaixaAbertura_caixaId_status_idx" ON "CaixaAbertura"("caixaId", "status");
CREATE INDEX "CaixaAbertura_dataAbertura_idx" ON "CaixaAbertura"("dataAbertura");
CREATE INDEX "CaixaAbertura_usuarioAberturaId_idx" ON "CaixaAbertura"("usuarioAberturaId");
CREATE INDEX "CaixaAbertura_usuarioFechamentoId_idx" ON "CaixaAbertura"("usuarioFechamentoId");

ALTER TABLE "CaixaAbertura"
ADD CONSTRAINT "CaixaAbertura_caixaId_fkey"
FOREIGN KEY ("caixaId") REFERENCES "Caixa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CaixaAbertura"
ADD CONSTRAINT "CaixaAbertura_usuarioAberturaId_fkey"
FOREIGN KEY ("usuarioAberturaId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CaixaAbertura"
ADD CONSTRAINT "CaixaAbertura_usuarioFechamentoId_fkey"
FOREIGN KEY ("usuarioFechamentoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MovimentoCaixa"
ADD CONSTRAINT "MovimentoCaixa_caixaAberturaId_fkey"
FOREIGN KEY ("caixaAberturaId") REFERENCES "CaixaAbertura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Lancamento"
ADD CONSTRAINT "Lancamento_caixaAberturaId_fkey"
FOREIGN KEY ("caixaAberturaId") REFERENCES "CaixaAbertura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LancamentoEstacionamento"
ADD CONSTRAINT "LancamentoEstacionamento_caixaAberturaId_fkey"
FOREIGN KEY ("caixaAberturaId") REFERENCES "CaixaAbertura"("id") ON DELETE SET NULL ON UPDATE CASCADE;
