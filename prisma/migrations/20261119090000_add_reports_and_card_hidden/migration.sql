-- CreateEnum
CREATE TYPE "ReportTarget" AS ENUM ('POST', 'CARD');

-- AlterEnum
ALTER TYPE "CardStatus" ADD VALUE 'HIDDEN';

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "target_type" "ReportTarget" NOT NULL,
    "target_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reason" TEXT,
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "handled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_target_type_handled_created_at_idx" ON "reports"("target_type", "handled", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reports_target_type_target_id_reporter_id_key" ON "reports"("target_type", "target_id", "reporter_id");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
