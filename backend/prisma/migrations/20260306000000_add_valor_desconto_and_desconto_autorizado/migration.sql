-- AlterTable
ALTER TABLE "Lancamento" ADD COLUMN "valorDesconto" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "descontoAutorizado" BOOLEAN NOT NULL DEFAULT false;
