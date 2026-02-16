-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dailyPrice" REAL NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "cabins" INTEGER,
    "location" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "description" TEXT NOT NULL,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Property" ("amenities", "createdAt", "dailyPrice", "description", "id", "latitude", "location", "longitude", "name", "type", "updatedAt") SELECT "amenities", "createdAt", "dailyPrice", "description", "id", "latitude", "location", "longitude", "name", "type", "updatedAt" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
