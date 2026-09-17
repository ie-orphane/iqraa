-- CreateTable
CREATE TABLE "book_lists" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "public_id" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_list_items" (
    "id" TEXT NOT NULL,
    "list_id" TEXT NOT NULL,
    "book_id" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "subtitle" TEXT,
    "author" TEXT,
    "pages" INTEGER,
    "cover_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_lists_public_id_key" ON "book_lists"("public_id");

-- CreateIndex
CREATE INDEX "book_lists_user_id_idx" ON "book_lists"("user_id");

-- CreateIndex
CREATE INDEX "book_list_items_list_id_idx" ON "book_list_items"("list_id");

-- CreateIndex
CREATE INDEX "book_list_items_book_id_idx" ON "book_list_items"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "book_list_items_list_id_book_id_key" ON "book_list_items"("list_id", "book_id");

-- AddForeignKey
ALTER TABLE "book_lists" ADD CONSTRAINT "book_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_list_items" ADD CONSTRAINT "book_list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "book_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_list_items" ADD CONSTRAINT "book_list_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
