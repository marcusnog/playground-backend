-- Add criancasAdicionaisJson to Lancamento (JSON array of additional children)
ALTER TABLE "Lancamento"
ADD COLUMN IF NOT EXISTS "criancasAdicionaisJson" TEXT;
