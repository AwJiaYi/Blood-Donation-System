-- Rename editToken to token (preserve existing credential values)
ALTER TABLE "Registration" RENAME COLUMN "editToken" TO "token";
