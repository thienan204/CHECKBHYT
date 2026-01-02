-- CreateTable
CREATE TABLE "DraftRule" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL,
    "xmlType" TEXT NOT NULL,
    "field" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "conditionField" TEXT,
    "conditionValue" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftRule_pkey" PRIMARY KEY ("id")
);
