-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "registry" TEXT NOT NULL,
    "subscribe" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "lastPay" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL,
    "ban" BOOLEAN NOT NULL,
    "banDate" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Password" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Generate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "flags" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "progress" TEXT NOT NULL,
    "proxy_url" TEXT NOT NULL,
    "options" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Custom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "flags" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "progress" TEXT NOT NULL,
    "proxy_url" TEXT NOT NULL,
    "options" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "media" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "button" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Password_id_key" ON "Password"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Password_password_key" ON "Password"("password");

-- CreateIndex
CREATE UNIQUE INDEX "Generate_id_key" ON "Generate"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Generate_userId_key" ON "Generate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Custom_id_key" ON "Custom"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Custom_userId_key" ON "Custom"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Announcement_id_key" ON "Announcement"("id");
