-- AlterTable: per-region availability flag for products (global on/off is System.active)
ALTER TABLE "SystemPrice" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
