-- AlterEnum
ALTER TYPE "QuoteStatus" ADD VALUE 'approved';

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "approvalIp" TEXT,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedByName" TEXT;
