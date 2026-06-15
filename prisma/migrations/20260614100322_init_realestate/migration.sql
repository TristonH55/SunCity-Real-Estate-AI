-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'agent');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('presented', 'locked');

-- CreateEnum
CREATE TYPE "SystemType" AS ENUM ('electric', 'heat_pump', 'solar_thermosiphon', 'solar_split');

-- CreateEnum
CREATE TYPE "TankMaterial" AS ENUM ('mild_steel', 'stainless_steel');

-- CreateEnum
CREATE TYPE "ExtraSystemType" AS ENUM ('electric', 'heat_pump', 'solar', 'all');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "systemType" "SystemType" NOT NULL,
    "tankMaterial" "TankMaterial" NOT NULL,
    "capacityLitres" INTEGER NOT NULL,
    "warrantyPrimaryYears" INTEGER NOT NULL,
    "warrantySecondaryYears" INTEGER,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemPrice" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "SystemPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extra" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "systemType" "ExtraSystemType" NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraPrice" (
    "id" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ExtraPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingConfirmation" (
    "id" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "insurerId" TEXT,
    "extraIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "basePriceExGst" DECIMAL(65,30) NOT NULL,
    "extrasTotalExGst" DECIMAL(65,30) NOT NULL,
    "subtotalExGst" DECIMAL(65,30) NOT NULL,
    "gst" DECIMAL(65,30) NOT NULL,
    "totalIncGst" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customerSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedByInsurer" TIMESTAMP(3),
    "lastViewedByAdmin" TIMESTAMP(3),
    "crmLeadSentAt" TIMESTAMP(3),

    CONSTRAINT "PricingConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "systemType" "SystemType" NOT NULL,
    "capacityLitres" INTEGER NOT NULL,
    "extraIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customerSnapshot" JSONB NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'presented',
    "selectedOptionId" TEXT,
    "confirmationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteOption" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "basePriceExGst" DECIMAL(65,30) NOT NULL,
    "extrasTotalExGst" DECIMAL(65,30) NOT NULL,
    "subtotalExGst" DECIMAL(65,30) NOT NULL,
    "gst" DECIMAL(65,30) NOT NULL,
    "totalIncGst" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "QuoteOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobNote" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Extra_code_key" ON "Extra"("code");

-- CreateIndex
CREATE INDEX "PricingConfirmation_regionCode_idx" ON "PricingConfirmation"("regionCode");

-- CreateIndex
CREATE INDEX "PricingConfirmation_systemId_idx" ON "PricingConfirmation"("systemId");

-- CreateIndex
CREATE INDEX "Quote_agentId_idx" ON "Quote"("agentId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "QuoteOption_quoteId_idx" ON "QuoteOption"("quoteId");

-- AddForeignKey
ALTER TABLE "SystemPrice" ADD CONSTRAINT "SystemPrice_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemPrice" ADD CONSTRAINT "SystemPrice_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraPrice" ADD CONSTRAINT "ExtraPrice_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraPrice" ADD CONSTRAINT "ExtraPrice_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteOption" ADD CONSTRAINT "QuoteOption_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteOption" ADD CONSTRAINT "QuoteOption_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobNote" ADD CONSTRAINT "JobNote_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PricingConfirmation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobNote" ADD CONSTRAINT "JobNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
