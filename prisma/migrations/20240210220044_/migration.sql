-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" BIGINT NOT NULL,
    "registry" BIGINT NOT NULL,
    "subscribe" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "ratio" TEXT NOT NULL,
    "lastPay" BIGINT NOT NULL,
    "admin" BOOLEAN NOT NULL,
    "treatment" BOOLEAN NOT NULL,
    "ban" BOOLEAN NOT NULL,
    "banDate" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "task_id" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "date" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "Password" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL
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
CREATE UNIQUE INDEX "Task_task_id_key" ON "Task"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "Password_id_key" ON "Password"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Password_password_key" ON "Password"("password");

-- CreateIndex
CREATE UNIQUE INDEX "Announcement_id_key" ON "Announcement"("id");
