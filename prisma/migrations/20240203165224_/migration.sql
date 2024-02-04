/*
  Warnings:

  - You are about to drop the column `content` on the `Generate` table. All the data in the column will be lost.
  - You are about to drop the column `flags` on the `Generate` table. All the data in the column will be lost.
  - You are about to drop the column `hash` on the `Generate` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `Generate` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Generate` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Generate` table. All the data in the column will be lost.
  - You are about to drop the column `proxy_url` on the `Generate` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Custom` table. All the data in the column will be lost.
  - You are about to drop the column `flags` on the `Custom` table. All the data in the column will be lost.
  - You are about to drop the column `hash` on the `Custom` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `Custom` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Custom` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Custom` table. All the data in the column will be lost.
  - You are about to drop the column `proxy_url` on the `Custom` table. All the data in the column will be lost.
  - Added the required column `data` to the `Generate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data` to the `Custom` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Generate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL
);
INSERT INTO "new_Generate" ("id", "userId") SELECT "id", "userId" FROM "Generate";
DROP TABLE "Generate";
ALTER TABLE "new_Generate" RENAME TO "Generate";
CREATE UNIQUE INDEX "Generate_id_key" ON "Generate"("id");
CREATE UNIQUE INDEX "Generate_userId_key" ON "Generate"("userId");
CREATE TABLE "new_Custom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL
);
INSERT INTO "new_Custom" ("id", "userId") SELECT "id", "userId" FROM "Custom";
DROP TABLE "Custom";
ALTER TABLE "new_Custom" RENAME TO "Custom";
CREATE UNIQUE INDEX "Custom_id_key" ON "Custom"("id");
CREATE UNIQUE INDEX "Custom_userId_key" ON "Custom"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
