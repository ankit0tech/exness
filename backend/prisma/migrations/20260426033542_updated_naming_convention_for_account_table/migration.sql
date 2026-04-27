/*
  Warnings:

  - You are about to drop the column `freeMargin` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `usedMargin` on the `account` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "account" DROP COLUMN "freeMargin",
DROP COLUMN "usedMargin",
ADD COLUMN     "free_margin" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "used_margin" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "userinfo" ADD COLUMN     "user_type" "UserType" NOT NULL DEFAULT 'USER';
