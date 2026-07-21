-- Brochure/info fields: add-on (Extra) info + brochure, and product (System) brochure.
ALTER TABLE "Extra" ADD COLUMN "infoText" TEXT;
ALTER TABLE "Extra" ADD COLUMN "brochureUrl" TEXT;
ALTER TABLE "System" ADD COLUMN "brochureUrl" TEXT;
