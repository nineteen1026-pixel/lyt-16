-- CreateTable
CREATE TABLE "Registration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assemblyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Registration_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "DharmaAssembly" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "remark" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_DharmaAssembly" ("createdAt", "endTime", "hall", "id", "master", "name", "remark", "startTime", "type", "updatedAt") SELECT "createdAt", "endTime", "hall", "id", "master", "name", "remark", "startTime", "type", "updatedAt" FROM "DharmaAssembly";
DROP TABLE "DharmaAssembly";
ALTER TABLE "new_DharmaAssembly" RENAME TO "DharmaAssembly";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Registration_assemblyId_phone_key" ON "Registration"("assemblyId", "phone");
