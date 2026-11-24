-- Per-region flat service fee, editable in /admin/prices. Starting amounts from
-- Darren (GST inclusive); admin edits after this are kept.
ALTER TABLE "Region" ADD COLUMN "serviceFee" DECIMAL(65,30) NOT NULL DEFAULT 0;

UPDATE "Region" SET "serviceFee" = 75 WHERE "code" IN ('brisbane_northside', 'wide_bay');
UPDATE "Region" SET "serviceFee" = 175 WHERE "code" IN ('brisbane_southside', 'gympie');
UPDATE "Region" SET "serviceFee" = 300 WHERE "code" = 'gold_coast';
