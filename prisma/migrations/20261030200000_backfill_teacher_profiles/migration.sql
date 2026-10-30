INSERT INTO "teachers" ("userId", "nip")
SELECT u."id", NULL
FROM "users" u
LEFT JOIN "teachers" t ON t."userId" = u."id"
WHERE u."role" = 'GURU' AND t."id" IS NULL;
