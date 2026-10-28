/*
  Warnings:

  - You are about to drop the column `score` on the `verifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "daily_entries" ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "verifications" DROP COLUMN "score";
