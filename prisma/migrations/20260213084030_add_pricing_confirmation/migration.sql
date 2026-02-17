-- CreateTable
CREATE TABLE "PricingConfirmation" (
    "id" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "extraIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "basePriceExGst" DECIMAL(65,30) NOT NULL,
    "extrasTotalExGst" DECIMAL(65,30) NOT NULL,
    "subtotalExGst" DECIMAL(65,30) NOT NULL,
    "gst" DECIMAL(65,30) NOT NULL,
    "totalIncGst" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingConfirmation_regionCode_idx" ON "PricingConfirmation"("regionCode");

-- CreateIndex
CREATE INDEX "PricingConfirmation_systemId_idx" ON "PricingConfirmation"("systemId");
