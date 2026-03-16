-- AlterTable
ALTER TABLE "DraftRule" ADD COLUMN     "checkNotNull" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conditionMaDichVu" TEXT,
ADD COLUMN     "conditionMaDichVuValue" TEXT,
ADD COLUMN     "isGroupCount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mathExpression" TEXT,
ADD COLUMN     "maxCountVal" INTEGER,
ADD COLUMN     "minCountVal" INTEGER;

-- AlterTable
ALTER TABLE "ValidationRule" ADD COLUMN     "checkNotNull" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conditionMaDichVu" TEXT,
ADD COLUMN     "conditionMaDichVuValue" TEXT,
ADD COLUMN     "isGroupCount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mathExpression" TEXT,
ADD COLUMN     "maxCountVal" INTEGER,
ADD COLUMN     "minCountVal" INTEGER;

-- CreateTable
CREATE TABLE "Department" (
    "ma_khoa" TEXT NOT NULL,
    "ten_khoa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("ma_khoa")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "ma_bac_si" TEXT NOT NULL,
    "trinh_do" TEXT,
    "chuc_danh" TEXT,
    "ma_khoa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Staff_ma_bac_si_key" ON "Staff"("ma_bac_si");

-- CreateIndex
CREATE UNIQUE INDEX "SpecializedRule_slug_key" ON "SpecializedRule"("slug");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_ma_khoa_fkey" FOREIGN KEY ("ma_khoa") REFERENCES "Department"("ma_khoa") ON DELETE RESTRICT ON UPDATE CASCADE;
