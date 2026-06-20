-- CreateTable
CREATE TABLE "AssemblyMaterialTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "remark" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AssemblyMaterialTemplateItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "remark" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "AssemblyMaterialTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AssemblyMaterialTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssemblyMaterialTemplateItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DharmaAssemblyMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assemblyId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "remark" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "DharmaAssemblyMaterial_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "DharmaAssembly" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DharmaAssemblyMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DharmaAssembly" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "master" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "hall" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "registrationDeadline" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "remark" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_DharmaAssembly" ("capacity", "createdAt", "endTime", "hall", "id", "master", "name", "registrationDeadline", "remark", "startTime", "type", "updatedAt") SELECT "capacity", "createdAt", "endTime", "hall", "id", "master", "name", "registrationDeadline", "remark", "startTime", "type", "updatedAt" FROM "DharmaAssembly";
DROP TABLE "DharmaAssembly";
ALTER TABLE "new_DharmaAssembly" RENAME TO "DharmaAssembly";
CREATE TABLE "new_PurchaseRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "applicant" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "remark" TEXT NOT NULL DEFAULT '',
    "assemblyId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseRequest_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "DharmaAssembly" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseRequest" ("applicant", "createdAt", "id", "remark", "status", "title", "updatedAt") SELECT "applicant", "createdAt", "id", "remark", "status", "title", "updatedAt" FROM "PurchaseRequest";
DROP TABLE "PurchaseRequest";
ALTER TABLE "new_PurchaseRequest" RENAME TO "PurchaseRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AssemblyMaterialTemplate_type_key" ON "AssemblyMaterialTemplate"("type");
