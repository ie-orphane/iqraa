-- AlterEnum
ALTER TYPE "book_status" ADD VALUE 'read_later';
ALTER TYPE "book_status" ADD VALUE 'incomplete';

-- AlterTable
ALTER TABLE "books" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "books" ALTER COLUMN "author" DROP NOT NULL;
