/*
  Warnings:

  - You are about to drop the column `type` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'password-excluded',
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "rating" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("contactNumber", "email", "firstName", "id", "lastName", "password", "rating", "username") SELECT "contactNumber", "email", "firstName", "id", "lastName", "password", "rating", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
