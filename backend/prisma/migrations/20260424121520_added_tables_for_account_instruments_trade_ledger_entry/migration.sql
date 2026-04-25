/*
  Warnings:

  - You are about to drop the column `googleId` on the `userinfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[google_id]` on the table `userinfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `userinfo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Side" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED', 'LIQUIDATED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRADE_PNL', 'FEE', 'ADJUSTMENT');

-- DropIndex
DROP INDEX "userinfo_googleId_key";

-- AlterTable
ALTER TABLE "userinfo" DROP COLUMN "googleId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "balance" BIGINT NOT NULL DEFAULT 0,
    "usedMargin" BIGINT NOT NULL DEFAULT 0,
    "freeMargin" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "base_asset" TEXT NOT NULL,
    "quote_currency" "Currency" NOT NULL DEFAULT 'USD',
    "max_leverage" INTEGER NOT NULL,
    "min_quantity" BIGINT NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "instrument_id" INTEGER NOT NULL,
    "side" "Side" NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
    "quantity" BIGINT NOT NULL,
    "leverage" INTEGER NOT NULL,
    "entry_price" BIGINT NOT NULL,
    "entry_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notional" BIGINT NOT NULL,
    "margin_used" BIGINT NOT NULL,
    "fees" BIGINT NOT NULL DEFAULT 0,
    "exit_price" BIGINT,
    "exit_time" TIMESTAMP(3),
    "realized_pnl" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entry" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "trade_id" INTEGER,
    "type" "LedgerType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "balance_after" BIGINT NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_user_id_key" ON "account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "instrument_symbol_key" ON "instrument"("symbol");

-- CreateIndex
CREATE INDEX "trade_user_id_status_idx" ON "trade"("user_id", "status");

-- CreateIndex
CREATE INDEX "trade_account_id_status_idx" ON "trade"("account_id", "status");

-- CreateIndex
CREATE INDEX "trade_instrument_id_idx" ON "trade"("instrument_id");

-- CreateIndex
CREATE INDEX "ledger_entry_account_id_created_at_idx" ON "ledger_entry"("account_id", "created_at");

-- CreateIndex
CREATE INDEX "ledger_entry_trade_id_idx" ON "ledger_entry"("trade_id");

-- CreateIndex
CREATE UNIQUE INDEX "userinfo_google_id_key" ON "userinfo"("google_id");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "userinfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "userinfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
