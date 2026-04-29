-- CreateEnum
CREATE TYPE "WatchStatus" AS ENUM ('PLAN_TO_WATCH', 'WATCHING', 'WATCHED');

-- CreateTable
CREATE TABLE "UserListItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catalogId" INTEGER NOT NULL,
    "status" "WatchStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserListItem_userId_idx" ON "UserListItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserListItem_userId_catalogId_key" ON "UserListItem"("userId", "catalogId");

-- AddForeignKey
ALTER TABLE "UserListItem" ADD CONSTRAINT "UserListItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
