-- AlterTable
ALTER TABLE "Cortesia" ADD COLUMN "clienteId" TEXT,
ADD COLUMN "whatsappDestino" TEXT NOT NULL DEFAULT '',
ADD COLUMN "validadeDias" INTEGER NOT NULL DEFAULT 7;

-- AddForeignKey
ALTER TABLE "Cortesia" ADD CONSTRAINT "Cortesia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
