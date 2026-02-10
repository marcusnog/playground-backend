-- AlterTable
ALTER TABLE "Caixa" ADD COLUMN "bloqueado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "bloqueado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CaixaBrinquedo" (
    "caixaId" TEXT NOT NULL,
    "brinquedoId" TEXT NOT NULL,

    CONSTRAINT "CaixaBrinquedo_pkey" PRIMARY KEY ("caixaId","brinquedoId")
);

-- AddForeignKey
ALTER TABLE "CaixaBrinquedo" ADD CONSTRAINT "CaixaBrinquedo_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaixaBrinquedo" ADD CONSTRAINT "CaixaBrinquedo_brinquedoId_fkey" FOREIGN KEY ("brinquedoId") REFERENCES "Brinquedo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
