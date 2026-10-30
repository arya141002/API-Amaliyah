ALTER TABLE "students" ADD COLUMN "name" TEXT;
ALTER TABLE "students" ADD COLUMN "branchId" INTEGER;
ALTER TABLE "students" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "students" AS s
SET
  "name" = u."name",
  "branchId" = u."branchId"
FROM "users" AS u
WHERE s."userId" = u."id";

UPDATE "students" AS s
SET "branchId" = c."branchId"
FROM "classes" AS c
WHERE s."classId" = c."id" AND s."branchId" IS NULL;

ALTER TABLE "students" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "students" ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "students" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "students"
  ADD CONSTRAINT "students_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "branches"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "students"
  DROP CONSTRAINT "students_userId_fkey";

ALTER TABLE "students"
  ADD CONSTRAINT "students_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
