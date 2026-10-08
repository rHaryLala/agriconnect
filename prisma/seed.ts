import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { config } from "dotenv";

config();

// Ce script VIDE toute la base avant d'insérer : jamais en production.
if (process.env.NODE_ENV === "production") {
  throw new Error("Seed interdit en production (il supprime toutes les données).");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL n'est pas défini (vérifie ton .env)");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const d = (iso: string) => new Date(iso);

async function cleanDatabase() {
  console.log("Nettoyage de la base (ordre inverse des dépendances)...");

  // Fournisseurs
  await prisma.supplierPayment.deleteMany();
  await prisma.supplierPurchase.deleteMany();
  await prisma.supplier.deleteMany();

  // Finance
  await prisma.salaryDeduction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.transactionCategory.deleteMany();

  // Stock
  await prisma.stockTransferItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockTransfer.deleteMany();

  // Riziculture (étapes avant le lot)
  await prisma.paddyMilling.deleteMany();
  await prisma.paddyDryingWave.deleteMany();
  await prisma.paddyProcess.deleteMany();

  // Main d'oeuvre (logs avant activités : onDelete Restrict)
  await prisma.laborLog.deleteMany();
  await prisma.laborActivity.deleteMany();

  // Élevage / production
  await prisma.poultryWeeklyRecord.deleteMany();
  await prisma.production.deleteMany();
  await prisma.poultryTracking.deleteMany();
  await prisma.cattle.deleteMany();

  await prisma.productVariant.deleteMany();
  await prisma.stockItem.deleteMany();
  await prisma.stockLocation.deleteMany();

  // Socle
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
  await prisma.client.create({
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
  // Mot de passe de DEV uniquement, hashé (jamais en clair en base).
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      email: "admin@agriconnect.com",
      password: passwordHash,
      firstName: "Simeon",
      lastName: "Sitrakiniaina",
      role: "ADMIN",
      status: "ACTIF",
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
      status: "ACTIF",
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
      status: "ACTIF",
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
      status: "ACTIF",
      farmId: farm.id,
    },
  });
  await prisma.user.create({
    data: {
      email: "controleur@agriconnect.com",
      password: passwordHash,
      firstName: "Nirina",
      lastName: "Rakotoson",
      role: "CONTROLEUR_INTERNE",
      status: "ACTIF",
      farmId: farm.id,
    },
  });
  // Compte suspendu : permet de tester le blocage d'accès sans suppression
  await prisma.user.create({
    data: {
      email: "ancien@agriconnect.com",
      password: passwordHash,
      firstName: "Ancien",
      lastName: "Employé",
      role: "OUVRIER",
      status: "SUSPENDU",
      farmId: farm.id,
    },
  });
  console.log("6 utilisateurs créés (un par rôle + un compte suspendu)");

  // ---------- SUPPLIER + ACHATS + PAIEMENTS ----------
  const supplier = await prisma.supplier.create({
    data: {
      name: "Semences Vakinankaratra",
      phone: "032 45 671 23",
      address: "Ambatolampy",
      category: "Semences et engrais",
      status: "ACTIF",
      rating: 4,
      paymentTermDays: 30,
      products: ["Semences riz", "Semences maïs", "Engrais NPK", "Urée"],
      farmId: farm.id,
    },
  });
  await prisma.supplier.create({
    data: {
      name: "Transport Miara-Dia",
      phone: "032 61 449 05",
      address: "Antananarivo",
      category: "Transport",
      status: "INACTIF",
      rating: 3,
      paymentTermDays: 0,
      products: ["Location camion", "Livraison Antananarivo"],
      farmId: farm.id,
    },
  });

  // Les trois statuts d'achat (REGLE / PARTIEL / EN_ATTENTE)
  const achatRegle = await prisma.supplierPurchase.create({
    data: {
      reference: "ACH-2026-005",
      description: "Semences riz — campagne 2026",
      totalAmount: 1750000,
      paidAmount: 1750000,
      status: "REGLE",
      date: d("2026-06-12"),
      supplierId: supplier.id,
      farmId: farm.id,
    },
  });
  const achatPartiel = await prisma.supplierPurchase.create({
    data: {
      reference: "ACH-2026-018",
      description: "Engrais NPK — 15 sacs",
      totalAmount: 1425000,
      paidAmount: 700000,
      status: "PARTIEL",
      date: d("2026-08-15"),
      supplierId: supplier.id,
      farmId: farm.id,
    },
  });
  await prisma.supplierPurchase.create({
    data: {
      reference: "ACH-2026-035",
      description: "Urée — 10 sacs",
      totalAmount: 920000,
      paidAmount: 0,
      status: "EN_ATTENTE",
      date: d("2026-09-12"),
      supplierId: supplier.id,
      farmId: farm.id,
    },
  });

  await prisma.supplierPayment.create({
    data: {
      amount: 1750000,
      method: "VIREMENT",
      date: d("2026-06-20"),
      purchaseId: achatRegle.id,
      userId: comptable.id,
    },
  });
  await prisma.supplierPayment.create({
    data: {
      amount: 700000,
      method: "MOBILE_MONEY",
      date: d("2026-08-20"),
      purchaseId: achatPartiel.id,
      userId: comptable.id,
    },
  });
  console.log("Fournisseurs + achats + paiements créés");

  // ---------- STOCK ITEMS + VARIANTS ----------
  const stockOeufs = await prisma.stockItem.create({
    data: {
      name: "Œufs", category: "Production", unit: "Alvéole",
      quantity: 120, miniAlert: 20, farmId: farm.id, locationId: locFerme.id,
    },
  });
  const stockRiz = await prisma.stockItem.create({
    data: {
      name: "Riz décortiqué", category: "Production", unit: "Kg",
      quantity: 500, miniAlert: 50, farmId: farm.id, locationId: locStore.id,
    },
  });
  const stockHaricot = await prisma.stockItem.create({
    data: {
      name: "Haricot sec", category: "Production", unit: "Kg",
      quantity: 80, miniAlert: 15, farmId: farm.id, locationId: locStore.id,
    },
  });
  const stockGasoil = await prisma.stockItem.create({
    data: {
      name: "Gasoil tracteur", category: "Intrant", unit: "Litre",
      quantity: 200, miniAlert: 30, farmId: farm.id, locationId: locFerme.id,
    },
  });
  const stockEngrais = await prisma.stockItem.create({
    data: {
      name: "Engrais NPK", category: "Intrant", unit: "Kg",
      quantity: 750, miniAlert: 100, farmId: farm.id, locationId: locFerme.id,
    },
  });

  const varianteHaricotRouge = await prisma.productVariant.create({
    data: { name: "Haricot rouge", sku: "AGR-HAR-ROUGE", unitPrice: 4500, quantity: 40, stockItemId: stockHaricot.id },
  });
  await prisma.productVariant.create({
    data: { name: "Haricot blanc", sku: "AGR-HAR-BLANC", unitPrice: 4200, quantity: 40, stockItemId: stockHaricot.id },
  });
  console.log("Articles de stock + variantes créés");

  // ---------- CATTLE ----------
  const vache1 = await prisma.cattle.create({
    data: {
      nameOrTag: "Vache-014", breed: "Pie Rouge", gender: "F",
      category: "Vache laitière", status: "EN_ELEVAGE",
      productivite: "PRODUCTIVE", reproduction: "NON_GESTANTE",
      entryType: "NAISSANCE", birthDate: d("2022-03-15"), farmId: farm.id,
    },
  });
  await prisma.cattle.create({
    data: {
      nameOrTag: "Vache-015", breed: "Holstein", gender: "F",
      category: "Vache laitière", status: "VENDU",
      saleDate: d("2026-08-01"), salePrice: 1200000,
      clientId: clientExterne.id, farmId: farm.id,
    },
  });
  console.log("Bovins créés");

  // ---------- POULTRY ----------
  const lotPondeuses = await prisma.poultryTracking.create({
    data: {
      tagOrNumber: "LOT-PONDEUSE-01", type: "PONDEUSE", status: "EN_ELEVAGE",
      initialAge: 18, farmId: farm.id, userId: ouvrier.id,
    },
  });
  await prisma.poultryWeeklyRecord.create({
    data: {
      poultryTrackingId: lotPondeuses.id, weekNumber: 1,
      weightKg: 1.6, ponteRate: 78.5, mortalityCount: 1,
    },
  });
  console.log("Suivi volaille créé");

  // ---------- PRODUCTION ----------
  // Lait par vache avec le détail matin / soir
  await prisma.production.create({
    data: {
      type: "LAIT", quantity: 14.5, morningQty: 8.5, eveningQty: 6,
      unit: "Litres", userId: ouvrier.id, farmId: farm.id, cattleId: vache1.id,
    },
  });
  await prisma.production.create({
    data: {
      type: "OEUFS", quantity: 95, unit: "Alvéoles",
      userId: ouvrier.id, farmId: farm.id,
      stockItemId: stockOeufs.id, poultryTrackingId: lotPondeuses.id,
    },
  });
  console.log("Productions créées");

  // ---------- RIZICULTURE : lot terminé + lot en cours ----------
  const lotTermine = await prisma.paddyProcess.create({
    data: {
      lotNumber: "PADDY-2026-01",
      paddyInputKg: 1000,
      paddyInputLot: 20,
      waveNumber: 3,
      status: "COMPLETED",
      harvestDate: d("2026-05-10"),
      transport: "Camion de la ferme",
      driverName: "Jean Razafy",
      storekeeperName: "Rado Andriamampianina",
      driedPaddyKg: 900,
      riceOutputKg: 585,
      userId: ouvrier.id,
      farmId: farm.id,
    },
  });
  await prisma.paddyDryingWave.createMany({
    data: [
      { processId: lotTermine.id, userId: ouvrier.id, waveNumber: 1, type: "PASSAGE",
        date: d("2026-05-11"), quantityOutKg: 1000, quantityReturnedKg: 1000 },
      { processId: lotTermine.id, userId: ouvrier.id, waveNumber: 2, type: "PASSAGE",
        date: d("2026-05-12"), quantityOutKg: 1000, quantityReturnedKg: 960 },
      { processId: lotTermine.id, userId: ouvrier.id, waveNumber: 3, type: "FINALISATION",
        date: d("2026-05-13"), bags: 18, dryPaddyKg: 900 },
    ],
  });
  await prisma.paddyMilling.create({
    data: {
      processId: lotTermine.id,
      userId: ouvrier.id,
      date: d("2026-05-15"),
      paddyUsedKg: 900,
      riceOutputKg: 585, // rendement ~65 %
      riceStockItemId: stockRiz.id,
      note: "Décorticage complet du lot",
    },
  });

  const lotEnCours = await prisma.paddyProcess.create({
    data: {
      lotNumber: "PADDY-2026-02",
      paddyInputKg: 600,
      paddyInputLot: 12,
      waveNumber: 1,
      status: "IN_PROGRESS",
      harvestDate: d("2026-09-20"),
      userId: ouvrier.id,
      farmId: farm.id,
    },
  });
  await prisma.paddyDryingWave.create({
    data: {
      processId: lotEnCours.id, userId: ouvrier.id, waveNumber: 1, type: "PASSAGE",
      date: d("2026-09-21"), quantityOutKg: 600, quantityReturnedKg: 600,
    },
  });
  console.log("Riziculture (2 lots, vagues, décorticage) créée");

  // ---------- MAIN D'OEUVRE JOURNALIÈRE ----------
  // Libellés à valider avec quelqu'un à l'aise avec le malgache (cf. plan Semaine 3)
  const activityNames = [
    "Sarclage", "Riziculture", "Récolte",
    "Traite et transport du lait", "Ramassage des œufs", "Maraîchage",
  ];
  const activities: Record<string, { id: string }> = {};
  for (const name of activityNames) {
    activities[name] = await prisma.laborActivity.create({
      data: { name, farmId: farm.id },
    });
  }
  await prisma.laborLog.createMany({
    data: [
      { activityId: activities["Sarclage"].id, workerCount: 6, date: d("2026-09-21"),
        note: "Parcelle P03", farmId: farm.id, userId: ouvrier.id },
      { activityId: activities["Traite et transport du lait"].id, workerCount: 2, date: d("2026-09-21"),
        farmId: farm.id, userId: ouvrier.id },
      { activityId: activities["Ramassage des œufs"].id, workerCount: 1, date: d("2026-09-21"),
        farmId: farm.id, userId: ouvrier.id },
    ],
  });
  console.log("Main d'oeuvre journalière créée");

  // ---------- STOCK : TRANSFERT + MOUVEMENTS ----------
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
      type: "OUT", quantity: 100,
      userId: ouvrier.id, itemId: stockRiz.id, transfertId: transfert.id,
    },
  });
  await prisma.stockMovement.create({
    data: {
      type: "IN", quantity: 100, repeseeQuantity: 98,
      userId: magasinier.id, itemId: stockRiz.id, transfertId: transfert.id,
      reason: "Écart constaté au repesage",
    },
  });

  // Engrais par type de culture + carburant par engin
  await prisma.stockMovement.create({
    data: {
      type: "OUT", quantity: 50, reason: "Épandage rizière",
      cultureType: "RIZ", parcel: "P03", voucherNumber: "BON-2026-014",
      userId: ouvrier.id, itemId: stockEngrais.id,
    },
  });
  await prisma.stockMovement.create({
    data: {
      type: "OUT", quantity: 40, reason: "Labour parcelle P03",
      cultureType: "RIZ", parcel: "P03", equipment: "Tracteur", voucherNumber: "BON-2026-015",
      userId: ouvrier.id, itemId: stockGasoil.id,
    },
  });
  console.log("Transfert + mouvements (engrais, carburant) créés");

  // ---------- INVOICE + ITEM + PAYMENT ----------
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "FAC-2026-001",
      totalAmount: 90000, paidAmount: 40000, dueAmount: 50000,
      status: "PARTIALLY_PAID",
      clientId: clientExterne.id, farmId: farm.id,
    },
  });
  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice.id, itemId: stockHaricot.id, variantId: varianteHaricotRouge.id,
      quantity: 20, unitPrice: 4500, total: 90000,
    },
  });
  await prisma.payment.create({
    data: {
      recuNumber: "REC-2026-001", amount: 40000, method: "CAISSE",
      invoiceId: invoice.id, userId: comptable.id,
    },
  });

  // ---------- RETENUE SUR SALAIRE ----------
  const invoiceRetenue = await prisma.invoice.create({
    data: {
      invoiceNumber: "FAC-2026-002",
      totalAmount: 15000, paidAmount: 15000, dueAmount: 0,
      status: "PAID",
      clientId: clientPersonnelUaz.id, farmId: farm.id,
    },
  });
  const paymentRetenue = await prisma.payment.create({
    data: {
      recuNumber: "REC-2026-002", amount: 15000, method: "RETENUE_SUR_SALAIRE",
      invoiceId: invoiceRetenue.id, userId: comptable.id,
    },
  });
  await prisma.salaryDeduction.create({
    data: {
      amount: 15000, status: "PENDING", period: "2026-09",
      paymentId: paymentRetenue.id, employeeId: employeeOuvrier.id,
    },
  });
  console.log("Factures, paiements et retenue sur salaire créés");

  // ---------- CATÉGORIES + TRANSACTIONS ----------
  const catVentes = await prisma.transactionCategory.create({
    data: { name: "Ventes", farmId: farm.id },
  });
  const catIntrants = await prisma.transactionCategory.create({
    data: { name: "Achats d'intrants", farmId: farm.id },
  });
  await prisma.transactionCategory.create({
    data: { name: "Salaires et main d'oeuvre", farmId: farm.id },
  });

  await prisma.transaction.create({
    data: {
      amount: 40000, type: "RECETTE", reference: invoice.invoiceNumber,
      invoiceId: invoice.id, userId: comptable.id, farmId: farm.id,
      clientId: clientExterne.id, categoryId: catVentes.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 700000, type: "DEPENSE", reference: achatPartiel.reference,
      notes: "Acompte engrais NPK", userId: comptable.id, farmId: farm.id,
      categoryId: catIntrants.id,
    },
  });
  console.log("Transactions créées");

  console.log("✅ Seeding terminé avec succès (28 tables couvertes).");
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