-- AlterTable
ALTER TABLE "books" ADD COLUMN "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];
