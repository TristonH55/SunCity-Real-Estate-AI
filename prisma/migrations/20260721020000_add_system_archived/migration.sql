-- Soft-delete flag for products: hidden from admin list + quotes, restorable.
ALTER TABLE "System" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
