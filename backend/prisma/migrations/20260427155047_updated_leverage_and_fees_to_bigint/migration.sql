-- AlterTable
ALTER TABLE "instrument" ALTER COLUMN "max_leverage" SET DATA TYPE BIGINT,
ALTER COLUMN "fees_per_unit" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "trade" ALTER COLUMN "leverage" SET DATA TYPE BIGINT;
