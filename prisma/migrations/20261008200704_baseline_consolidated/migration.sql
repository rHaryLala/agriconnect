-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COMPTABLE', 'OUVRIER', 'MAGASINIER', 'CONTROLEUR_INTERNE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "ProductionType" AS ENUM ('OEUFS', 'LAIT', 'VIANDE', 'RECOLTES', 'POULARD', 'KUROILER', 'PADDY', 'HARICOT');

-- CreateEnum
CREATE TYPE "MouvementType" AS ENUM ('IN', 'OUT', 'AJUSTEMENT', 'TRANSFERT');

-- CreateEnum
CREATE TYPE "CultureType" AS ENUM ('RIZ', 'HARICOT', 'MAIS', 'MIMOSA', 'MARAICHERE');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('EXTERNE', 'INTERNE', 'PERSONNEL_UAZ', 'CAF', 'AGENT_STORE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PAID', 'PARTIALLY_PAID');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RECETTE', 'DEPENSE');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('FERME', 'STORE', 'TRANSIT', 'MAGASINIER');

-- CreateEnum
CREATE TYPE "StatusBovin" AS ENUM ('EN_ELEVAGE', 'VENDU', 'DECEDE');

-- CreateEnum
CREATE TYPE "EntryTypeBovin" AS ENUM ('NAISSANCE', 'ACHAT');

-- CreateEnum
CREATE TYPE "ProductiviteBovin" AS ENUM ('PRODUCTIVE', 'TARIE');

-- CreateEnum
CREATE TYPE "ReproductionBovin" AS ENUM ('GESTANTE', 'NON_GESTANTE', 'ALLAITANTE', 'NON_ALLAITANTE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CAISSE', 'RETENUE_SUR_SALAIRE');

-- CreateEnum
CREATE TYPE "DeductionStatus" AS ENUM ('PENDING', 'DEDUCTED');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DryingEventType" AS ENUM ('PASSAGE', 'FINALISATION');

-- CreateEnum
CREATE TYPE "PoultryType" AS ENUM ('PONDEUSE', 'KUROILER', 'POULARD');

-- CreateEnum
CREATE TYPE "PoultryStatus" AS ENUM ('EN_ELEVAGE', 'EN_COUVEUSE', 'VENDU', 'DECEDE');

-- CreateEnum
CREATE TYPE "TransfertStatus" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIF', 'INACTIF');

-- CreateEnum
CREATE TYPE "SupplierPaymentMethod" AS ENUM ('CAISSE', 'VIREMENT', 'CHEQUE', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('EN_ATTENTE', 'PARTIEL', 'REGLE');

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OUVRIER',
    "farmId" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIF',
    "employeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "matricule" TEXT,
    "department" TEXT,
    "position" TEXT,
    "phone" TEXT,
    "farmId" TEXT NOT NULL,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Production" (
    "id" TEXT NOT NULL,
    "type" "ProductionType" NOT NULL,
    "quantity" DECIMAL(10,2),
    "unit" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "stockItemId" TEXT,
    "variantId" TEXT,
    "cattleId" TEXT,
    "poultryTrackingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "morningQty" DECIMAL(10,2),
    "eveningQty" DECIMAL(10,2),

    CONSTRAINT "Production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'AUTRE',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "miniAlert" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "farmId" TEXT NOT NULL,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "type" "MouvementType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "repeseeQuantity" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "variantId" TEXT,
    "originalMovementId" TEXT,
    "transfertId" TEXT,
    "cultureType" "CultureType",
    "parcel" TEXT,
    "equipment" TEXT,
    "voucherNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "type" "ClientType" NOT NULL DEFAULT 'INTERNE',
    "matricule_uaz" TEXT,
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "numero_du_recu" TEXT NOT NULL,
    "total_ttc" DECIMAL(14,2) NOT NULL,
    "montant_regle" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "reste_a_payer" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "statut_du_paiment" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "clientId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "variantId" TEXT,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'RECETTE',
    "reference" TEXT,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" TEXT,
    "userId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'FERME',
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cattle" (
    "id" TEXT NOT NULL,
    "nameOrTag" TEXT NOT NULL,
    "breed" TEXT,
    "gender" TEXT NOT NULL,
    "category" TEXT DEFAULT 'Vache laitière',
    "status" "StatusBovin" NOT NULL DEFAULT 'EN_ELEVAGE',
    "productivite" "ProductiviteBovin",
    "reproduction" "ReproductionBovin",
    "entryType" "EntryTypeBovin" NOT NULL DEFAULT 'NAISSANCE',
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "birthDate" TIMESTAMP(3),
    "saleDate" TIMESTAMP(3),
    "salePrice" DECIMAL(14,2),
    "signature" TEXT,
    "clientId" TEXT,
    "deathDate" TIMESTAMP(3),
    "deathReason" TEXT,
    "notes" TEXT,
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cattle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "recuNumber" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'CAISSE',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryDeduction" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "DeductionStatus" NOT NULL DEFAULT 'PENDING',
    "period" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaddyProcess" (
    "id" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "paddyInputKg" DOUBLE PRECISION NOT NULL,
    "paddyInputLot" INTEGER NOT NULL,
    "waveNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "ProcessStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "driedPaddyKg" DOUBLE PRECISION,
    "riceOutputKg" DOUBLE PRECISION,
    "harvestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transport" TEXT,
    "driverName" TEXT,
    "storekeeperName" TEXT,
    "note" TEXT,
    "userId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaddyProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaddyDryingWave" (
    "id" TEXT NOT NULL,
    "waveNumber" INTEGER NOT NULL,
    "type" "DryingEventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantityOutKg" DOUBLE PRECISION,
    "quantityReturnedKg" DOUBLE PRECISION,
    "bags" INTEGER,
    "dryPaddyKg" DOUBLE PRECISION,
    "note" TEXT,
    "processId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaddyDryingWave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaddyMilling" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paddyUsedKg" DOUBLE PRECISION NOT NULL,
    "riceOutputKg" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "processId" TEXT NOT NULL,
    "riceStockItemId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaddyMilling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "unitPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stockItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransfer" (
    "id" TEXT NOT NULL,
    "transfertNumber" TEXT NOT NULL,
    "status" "TransfertStatus" NOT NULL DEFAULT 'PENDING',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromLocationId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    "senderId" TEXT,
    "receiverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransferItem" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "transfertId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "variantId" TEXT,

    CONSTRAINT "StockTransferItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoultryTracking" (
    "id" TEXT NOT NULL,
    "tagOrNumber" TEXT,
    "type" "PoultryType" NOT NULL,
    "status" "PoultryStatus" NOT NULL DEFAULT 'EN_ELEVAGE',
    "initialAge" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitDate" TIMESTAMP(3),
    "exitReason" TEXT,
    "salePrice" DECIMAL(14,2),
    "farmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoultryTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoultryWeeklyRecord" (
    "id" TEXT NOT NULL,
    "poultryTrackingId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" DOUBLE PRECISION,
    "ponteRate" DOUBLE PRECISION,
    "mortalityCount" INTEGER NOT NULL DEFAULT 0,
    "vaccineName" TEXT,
    "vaccineDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoultryWeeklyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "category" TEXT,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIF',
    "rating" DOUBLE PRECISION,
    "paymentTermDays" INTEGER,
    "products" TEXT[],
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierPurchase" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "farmId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierPayment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "method" "SupplierPaymentMethod" NOT NULL DEFAULT 'CAISSE',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchaseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaborActivity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaborLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workerCount" INTEGER NOT NULL,
    "note" TEXT,
    "activityId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE INDEX "User_farmId_idx" ON "User"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_clientId_key" ON "Employee"("clientId");

-- CreateIndex
CREATE INDEX "Employee_farmId_idx" ON "Employee"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_farmId_matricule_key" ON "Employee"("farmId", "matricule");

-- CreateIndex
CREATE INDEX "Production_farmId_date_idx" ON "Production"("farmId", "date" DESC);

-- CreateIndex
CREATE INDEX "Production_poultryTrackingId_idx" ON "Production"("poultryTrackingId");

-- CreateIndex
CREATE INDEX "Production_cattleId_idx" ON "Production"("cattleId");

-- CreateIndex
CREATE INDEX "StockItem_farmId_idx" ON "StockItem"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "StockItem_farmId_name_key" ON "StockItem"("farmId", "name");

-- CreateIndex
CREATE INDEX "StockMovement_cultureType_idx" ON "StockMovement"("cultureType");

-- CreateIndex
CREATE INDEX "Invoice_farmId_statut_du_paiment_idx" ON "Invoice"("farmId", "statut_du_paiment");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_farmId_numero_du_recu_key" ON "Invoice"("farmId", "numero_du_recu");

-- CreateIndex
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");

-- CreateIndex
CREATE INDEX "Transaction_farmId_date_idx" ON "Transaction"("farmId", "date" DESC);

-- CreateIndex
CREATE INDEX "Transaction_farmId_type_date_idx" ON "Transaction"("farmId", "type", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "StockLocation_farmId_name_key" ON "StockLocation"("farmId", "name");

-- CreateIndex
CREATE INDEX "Cattle_farmId_idx" ON "Cattle"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Cattle_farmId_nameOrTag_key" ON "Cattle"("farmId", "nameOrTag");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_recuNumber_key" ON "Payment"("recuNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryDeduction_paymentId_key" ON "SalaryDeduction"("paymentId");

-- CreateIndex
CREATE INDEX "PaddyProcess_farmId_harvestDate_idx" ON "PaddyProcess"("farmId", "harvestDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PaddyProcess_farmId_lotNumber_key" ON "PaddyProcess"("farmId", "lotNumber");

-- CreateIndex
CREATE INDEX "PaddyDryingWave_processId_date_idx" ON "PaddyDryingWave"("processId", "date" DESC);

-- CreateIndex
CREATE INDEX "PaddyMilling_processId_date_idx" ON "PaddyMilling"("processId", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "StockTransfer_transfertNumber_key" ON "StockTransfer"("transfertNumber");

-- CreateIndex
CREATE INDEX "PoultryTracking_farmId_idx" ON "PoultryTracking"("farmId");

-- CreateIndex
CREATE INDEX "PoultryTracking_userId_idx" ON "PoultryTracking"("userId");

-- CreateIndex
CREATE INDEX "PoultryWeeklyRecord_poultryTrackingId_idx" ON "PoultryWeeklyRecord"("poultryTrackingId");

-- CreateIndex
CREATE INDEX "Supplier_farmId_idx" ON "Supplier"("farmId");

-- CreateIndex
CREATE INDEX "SupplierPurchase_farmId_status_idx" ON "SupplierPurchase"("farmId", "status");

-- CreateIndex
CREATE INDEX "SupplierPurchase_supplierId_idx" ON "SupplierPurchase"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierPurchase_farmId_reference_key" ON "SupplierPurchase"("farmId", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "LaborActivity_farmId_name_key" ON "LaborActivity"("farmId", "name");

-- CreateIndex
CREATE INDEX "LaborLog_farmId_date_idx" ON "LaborLog"("farmId", "date" DESC);

-- CreateIndex
CREATE INDEX "LaborLog_activityId_idx" ON "LaborLog"("activityId");

-- CreateIndex
CREATE INDEX "TransactionCategory_farmId_idx" ON "TransactionCategory"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCategory_farmId_name_key" ON "TransactionCategory"("farmId", "name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Production" ADD CONSTRAINT "Production_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Production" ADD CONSTRAINT "Production_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Production" ADD CONSTRAINT "Production_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Production" ADD CONSTRAINT "Production_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Production" ADD CONSTRAINT "Production_cattleId_fkey" FOREIGN KEY ("cattleId") REFERENCES "Cattle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Production" ADD CONSTRAINT "Production_poultryTrackingId_fkey" FOREIGN KEY ("poultryTrackingId") REFERENCES "PoultryTracking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "StockLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_originalMovementId_fkey" FOREIGN KEY ("originalMovementId") REFERENCES "StockMovement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_transfertId_fkey" FOREIGN KEY ("transfertId") REFERENCES "StockTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cattle" ADD CONSTRAINT "Cattle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cattle" ADD CONSTRAINT "Cattle_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryDeduction" ADD CONSTRAINT "SalaryDeduction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryDeduction" ADD CONSTRAINT "SalaryDeduction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaddyProcess" ADD CONSTRAINT "PaddyProcess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaddyProcess" ADD CONSTRAINT "PaddyProcess_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaddyDryingWave" ADD CONSTRAINT "PaddyDryingWave_processId_fkey" FOREIGN KEY ("processId") REFERENCES "PaddyProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaddyDryingWave" ADD CONSTRAINT "PaddyDryingWave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaddyMilling" ADD CONSTRAINT "PaddyMilling_processId_fkey" FOREIGN KEY ("processId") REFERENCES "PaddyProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaddyMilling" ADD CONSTRAINT "PaddyMilling_riceStockItemId_fkey" FOREIGN KEY ("riceStockItemId") REFERENCES "StockItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaddyMilling" ADD CONSTRAINT "PaddyMilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "StockLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "StockLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_transfertId_fkey" FOREIGN KEY ("transfertId") REFERENCES "StockTransfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoultryTracking" ADD CONSTRAINT "PoultryTracking_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoultryTracking" ADD CONSTRAINT "PoultryTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoultryWeeklyRecord" ADD CONSTRAINT "PoultryWeeklyRecord_poultryTrackingId_fkey" FOREIGN KEY ("poultryTrackingId") REFERENCES "PoultryTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPurchase" ADD CONSTRAINT "SupplierPurchase_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPurchase" ADD CONSTRAINT "SupplierPurchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "SupplierPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaborActivity" ADD CONSTRAINT "LaborActivity_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaborLog" ADD CONSTRAINT "LaborLog_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "LaborActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaborLog" ADD CONSTRAINT "LaborLog_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaborLog" ADD CONSTRAINT "LaborLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionCategory" ADD CONSTRAINT "TransactionCategory_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
