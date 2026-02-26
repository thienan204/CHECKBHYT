-- AlterTable
ALTER TABLE "DraftRule" ADD COLUMN     "checkNotNull" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conditionMaDichVu" TEXT,
ADD COLUMN     "conditionMaDichVuValue" TEXT,
ADD COLUMN     "mathExpression" TEXT;

-- AlterTable
ALTER TABLE "ValidationRule" ADD COLUMN     "checkNotNull" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conditionMaDichVu" TEXT,
ADD COLUMN     "conditionMaDichVuValue" TEXT,
ADD COLUMN     "mathExpression" TEXT;

-- CreateTable
CREATE TABLE "Department" (
    "ma_khoa" TEXT NOT NULL,
    "ten_khoa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("ma_khoa")
);

-- CreateTable
CREATE TABLE "DuplicateRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "machineCols" TEXT[],
    "serviceCol" TEXT,
    "startCol" TEXT NOT NULL,
    "endCol" TEXT NOT NULL,
    "ignoreMaMayMinusOne" BOOLEAN NOT NULL DEFAULT false,
    "ignoreNullValues" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "serviceValues" TEXT[],
    "excludedServiceValues" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DuplicateRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecializedRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "ruleType" TEXT NOT NULL,
    "logicConfig" JSONB,
    "sqlQuery" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecializedRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecializedRule_slug_key" ON "SpecializedRule"("slug");
