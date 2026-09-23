import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { config } from "dotenv";
 
config();
 
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL n'est pas défini (vérifie ton .env)");
}
 
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
 
async function hash(pwd: string) {
  return bcrypt.hash(pwd, 10);
}
 
async function cleanDatabase() {
  console.log("Nettoyage de la base (ordre inverse des dépendances)...");
  // Tables enfants d'abord, remontée jusqu'aux tables socles
  await prisma.supplierPayment.deleteMany();
  await prisma.supplierPurchase.deleteMany();
  await prisma.supplier.deleteMany();
 
  await prisma.salaryDeduction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.transaction.deleteMany();
 
  await prisma.stockTransferItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockTransfer.deleteMany();
 
  await prisma.poultryWeeklyRecord.deleteMany();
  await prisma.production.deleteMany();
  await prisma.poultryTracking.deleteMany();
  await prisma.cattle.deleteMany();
  await prisma.paddyProcess.deleteMany();
 
  await prisma.productVariant.deleteMany();
  await prisma.stockItem.deleteMany();
  await prisma.stockLocation.deleteMany();
 
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.client.deleteMany();
  await prisma.farm.deleteMany();
}
 
async function main() {
  await cleanDatabase();
 
  // ---------- FARM ----------
  const farm = await prisma.farm.create({
    data: { name: "Agriconnect Test1", location: "Sambaina" },
  });
  console.log(`Ferme créée : ${farm.name}`);
 
  // ---------- CLIENTS ----------
  const clientExterne = await prisma.client.create({
    data: { name: "Épicerie Faravohitra", phone: "0341234567", type: "EXTERNE", farmId: farm.id },
  });
  const clientStore = await prisma.client.create({
    data: { name: "Store Ferme (compte interne)", type: "AGENT_STORE", farmId: farm.id },
  });
  const clientPersonnelUaz = await prisma.client.create({
    data: {
      name: "Voahary Radoniaina (compte retenue)",
      type: "PERSONNEL_UAZ",
      matriculeuaz: "UAZ-0012",
      farmId: farm.id,
    },
  });
  console.log("Clients créés");
 
  // ---------- SUPPLIER ----------
  const supplier = await prisma.supplier.create({
    data: { name: "Fournisseur Intrants Sambaina", phone: "0331112233", farmId: farm.id },
  });
  const supplierPurchase = await prisma.supplierPurchase.create({
    data: {
      reference: "ACH-2026-001",
      totalAmount: 450000,
      paidAmount: 200000,
      supplierId: supplier.id,
    },
  });
  await prisma.supplierPayment.create({
    data: { amount: 200000, method: "CAISSE", purchaseId: supplierPurchase.id },
  });
  console.log("Fournisseur + achat + paiement créés");
 
  // ---------- STOCK LOCATIONS ----------
  const locFerme = await prisma.stockLocation.create({
    data: { name: "Ferme principale", type: "FERME", farmId: farm.id },
  });
  const locStore = await prisma.stockLocation.create({
    data: { name: "Store central", type: "STORE", farmId: farm.id },
  });
  const locMagasinier = await prisma.stockLocation.create({
    data: { name: "Dépôt Magasinier", type: "MAGASINIER", farmId: farm.id },
  });
  console.log("Emplacements de stock créés");
 
  // ---------- EMPLOYEES ----------
  const employeeComptable = await prisma.employee.create({
    data: {
      firstName: "Lesoa",
      lastName: "Asandratra",
      matricule: "EMP-001",
      department: "Comptabilité",
      position: "Comptable",
      farmId: farm.id,
    },
  });
  const employeeOuvrier = await prisma.employee.create({
    data: {
      firstName: "Voahary",
      lastName: "Radoniaina",
      matricule: "EMP-002",
      department: "Production",
      position: "Ouvrier agricole",
      farmId: farm.id,
      clientId: clientPersonnelUaz.id, // lien vers le compte de retenue sur salaire
    },
  });
  console.log("Employés créés");
 
  // ---------- USERS ----------
  const passwordHash = await hash("password123");
 
  const admin = await prisma.user.create({
    data: {
      email: "admin@agriconnect.com",
      password: passwordHash,
      firstName: "Simeon",
      lastName: "Sitrakiniaina",
      role: "ADMIN",
      farmId: farm.id,
    },
  });
  const comptable = await prisma.user.create({
    data: {
      email: "comptable@agriconnect.com",
      password: passwordHash,
      firstName: "Lesoa",
      lastName: "Asandratra",
      role: "COMPTABLE",
      farmId: farm.id,
      employeeId: employeeComptable.id,
    },
  });
  const ouvrier = await prisma.user.create({
    data: {
      email: "ouvrier@agriconnect.com",
      password: passwordHash,
      firstName: "Voahary",
      lastName: "Radoniaina",
      role: "OUVRIER",
      farmId: farm.id,
      employeeId: employeeOuvrier.id,
    },
  });
  const magasinier = await prisma.user.create({
    data: {
      email: "magasinier@agriconnect.com",
      password: passwordHash,
      firstName: "Rado",
      lastName: "Andriamampianina",
      role: "MAGASINIER",
      farmId: farm.id,
    },
  });
  const controleur = await prisma.user.create({
    data: {
      email: "controleur@agriconnect.com",
      password: passwordHash,
      firstName: "Nirina",
      lastName: "Rakotoson",
      role: "CONTROLEUR_INTERNE",
      farmId: farm.id,
    },
  });
  console.log("5 utilisateurs créés (un par rôle)");
 
  // ---------- STOCK ITEMS + VARIANTS ----------
  const stockOeufs = await prisma.stockItem.create({
    data: {
      name: "Œufs",
      category: "Production",
      unit: "Alvéole",
      quantity: 120,
      miniAlert: 20,
      farmId: farm.id,
      locationId: locFerme.id,
    },
  });
  const stockRiz = await prisma.stockItem.create({
    data: {
      name: "Riz décortiqué",
      category: "Production",
      unit: "Kg",
      quantity: 500,
      miniAlert: 50,
      farmId: farm.id,
      locationId: locStore.id,
    },
  });
  const stockHaricot = await prisma.stockItem.create({
    data: {
      name: "Haricot sec",
      category: "Production",
      unit: "Kg",
      quantity: 80,
      miniAlert: 15,
      farmId: farm.id,
      locationId: locStore.id,
    },
  });
  const stockGasoil = await prisma.stockItem.create({
    data: {
      name: "Gasoil tracteur",
      category: "Intrant",
      unit: "Litre",
      quantity: 200,
      miniAlert: 30,
      farmId: farm.id,
      locationId: locFerme.id,
    },
  });
 
  const varianteHaricotRouge = await prisma.productVariant.create({
    data: { name: "Haricot rouge", sku: "AGR-HAR-ROUGE", unitPrice: 4500, quantity: 40, stockItemId: stockHaricot.id },
  });
  const varianteHaricotBlanc = await prisma.productVariant.create({
    data: { name: "Haricot blanc", sku: "AGR-HAR-BLANC", unitPrice: 4200, quantity: 40, stockItemId: stockHaricot.id },
  });
  console.log("Articles de stock + variantes créés");
 
  // ---------- CATTLE ----------
  const vache1 = await prisma.cattle.create({
    data: {
      nameOrTag: "Vache-014",
      breed: "Pie Rouge",
      gender: "F",
      category: "Vache laitière",
      status: "EN_ELEVAGE",
      productivite: "PRODUCTIVE",
      reproduction: "NON_GESTANTE",
      entryType: "NAISSANCE",
      birthDate: new Date("2022-03-15"),
      farmId: farm.id,
    },
  });
  const vache2 = await prisma.cattle.create({
    data: {
      nameOrTag: "Vache-015",
      breed: "Holstein",
      gender: "F",
      category: "Vache laitière",
      status: "VENDU",
      saleDate: new Date("2026-08-01"),
      salePrice: 1200000,
      clientId: clientExterne.id,
      farmId: farm.id,
    },
  });
  console.log("Bovins créés");
 
  // ---------- POULTRY ----------
  const lotPondeuses = await prisma.poultryTracking.create({
    data: {
      tagOrNumber: "LOT-PONDEUSE-01",
      type: "PONDEUSE",
      status: "EN_ELEVAGE",
      initialAge: 18,
      farmId: farm.id,
      userId: ouvrier.id,
    },
  });
  await prisma.poultryWeeklyRecord.create({
    data: {
      poultryTrackingId: lotPondeuses.id,
      weekNumber: 1,
      weightKg: 1.6,
      ponteRate: 78.5,
      mortalityCount: 1,
    },
  });
  console.log("Suivi volaille créé");
 
  // ---------- PADDY ----------
  await prisma.paddyProcess.create({
    data: {
      lotNumber: "PADDY-2026-01",
      paddyInputKg: 1000,
      paddyInputLot: 20,
      waveNumber: 1,
      status: "IN_PROGRESS",
      farmId: farm.id,
    },
  });
  console.log("Lot paddy créé");
 
  // ---------- PRODUCTION ----------
  await prisma.production.create({
    data: {
      type: "LAIT",
      quantity: 14.5,
      unit: "Litres",
      userId: ouvrier.id,
      farmId: farm.id,
      cattleId: vache1.id,
    },
  });
  await prisma.production.create({
    data: {
      type: "OEUFS",
      quantity: 95,
      unit: "Alvéoles",
      userId: ouvrier.id,
      farmId: farm.id,
      stockItemId: stockOeufs.id,
      poultryTrackingId: lotPondeuses.id,
    },
  });
  console.log("Productions créées");
 
  // ---------- STOCK MOVEMENT + TRANSFER ----------
  const transfert = await prisma.stockTransfer.create({
    data: {
      transfertNumber: "TRF-2026-001",
      status: "COMPLETED",
      fromLocationId: locFerme.id,
      toLocationId: locMagasinier.id,
      senderId: ouvrier.id,
      receiverId: magasinier.id,
    },
  });
  await prisma.stockTransferItem.create({
    data: { transfertId: transfert.id, itemId: stockRiz.id, quantity: 100 },
  });
  await prisma.stockMovement.create({
    data: {
      type: "OUT",
      quantity: 100,
      userId: ouvrier.id,
      itemId: stockRiz.id,
      transfertId: transfert.id,
    },
  });
  await prisma.stockMovement.create({
    data: {
      type: "IN",
      quantity: 100,
      repeseeQuantity: 98,
      userId: magasinier.id,
      itemId: stockRiz.id,
      transfertId: transfert.id,
      reason: "Écart constaté au repesage",
    },
  });
  console.log("Transfert de stock + mouvements créés");
 
  // ---------- INVOICE + ITEM + PAYMENT ----------
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "FAC-2026-001",
      totalAmount: 90000,
      paidAmount: 40000,
      dueAmount: 50000,
      status: "PARTIALLY_PAID",
      clientId: clientExterne.id,
      farmId: farm.id,
    },
  });
  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice.id,
      itemId: stockHaricot.id,
      variantId: varianteHaricotRouge.id,
      quantity: 20,
      unitPrice: 4500,
      total: 90000,
    },
  });
  const payment = await prisma.payment.create({
    data: {
      recuNumber: "REC-2026-001",
      amount: 40000,
      method: "CAISSE",
      invoiceId: invoice.id,
      userId: comptable.id,
    },
  });
  console.log("Facture + ligne + paiement créés");
 
  // ---------- SALARY DEDUCTION ----------
  const invoiceRetenue = await prisma.invoice.create({
    data: {
      invoiceNumber: "FAC-2026-002",
      totalAmount: 15000,
      paidAmount: 15000,
      dueAmount: 0,
      status: "PAID",
      clientId: clientPersonnelUaz.id,
      farmId: farm.id,
    },
  });
  const paymentRetenue = await prisma.payment.create({
    data: {
      recuNumber: "REC-2026-002",
      amount: 15000,
      method: "RETENUE_SUR_SALAIRE",
      invoiceId: invoiceRetenue.id,
      userId: comptable.id,
    },
  });
  await prisma.salaryDeduction.create({
    data: {
      amount: 15000,
      status: "PENDING",
      period: "2026-09",
      paymentId: paymentRetenue.id,
      employeeId: employeeOuvrier.id,
    },
  });
  console.log("Retenue sur salaire créée");
 
  // ---------- TRANSACTIONS ----------
  await prisma.transaction.create({
    data: {
      amount: 40000,
      type: "RECETTE",
      reference: invoice.invoiceNumber,
      invoiceId: invoice.id,
      userId: comptable.id,
      farmId: farm.id,
      clientId: clientExterne.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 200000,
      type: "DEPENSE",
      reference: supplierPurchase.reference,
      notes: "Achat intrants",
      userId: comptable.id,
      farmId: farm.id,
    },
  });
  console.log("Transactions créées");
 
  console.log("✅ Seeding terminé avec succès pour les 23 tables.");
}
 
main()
  .catch((e) => {
    console.error("❌ Erreur lors de l'insertion :", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });