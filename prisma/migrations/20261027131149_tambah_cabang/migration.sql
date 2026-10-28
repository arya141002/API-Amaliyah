/*
  Warnings:

  - A unique constraint covering the columns `[branchId,name]` on the table `amaliah_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[branchId,academicYear,term]` on the table `semesters` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `branchId` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `semesters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN_SEKOLAH';

-- AlterTable
ALTER TABLE "amaliah_items" ADD COLUMN     "branchId" INTEGER;

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "branchId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "semesters" ADD COLUMN     "branchId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "branchId" INTEGER;

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "amaliah_items_branchId_name_key" ON "amaliah_items"("branchId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_branchId_academicYear_term_key" ON "semesters"("branchId", "academicYear", "term");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amaliah_items" ADD CONSTRAINT "amaliah_items_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
