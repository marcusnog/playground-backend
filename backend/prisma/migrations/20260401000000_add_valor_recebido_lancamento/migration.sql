-- Add valorRecebido to Lancamento (cash received for change calculation)
ALTER TABLE "Lancamento"
ADD COLUMN IF NOT EXISTS "valorRecebido" DOUBLE PRECISION;
