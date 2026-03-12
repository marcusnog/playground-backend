-- CreateTable
CREATE TABLE "Cortesia" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "lancamentoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cortesia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cortesia_codigo_key" ON "Cortesia"("codigo");

-- CreateIndex
CREATE INDEX "Cortesia_codigo_idx" ON "Cortesia"("codigo");

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "cortesia" BOOLEAN NOT NULL DEFAULT false;
