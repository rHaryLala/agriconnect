import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";


import { config } from "dotenv";
config;

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:jerosalema666@localhost:5432/agriconnect?schema=public";
  
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log( "Données de test en cours d'insertion...");

  await prisma.user.deleteMany();
  await prisma.farm.deleteMany();

  const farm = await prisma.farm.create({
    data: {
      name: "Agriconnect Test1",
      location: "Sambaina",
    },
  });

  console.log(`Ferme créée : ${farm.name} (ID: ${farm.id})`);

  const users = await prisma.user.createMany({
    data: [
      {
        email: "admin@agriconnect.com",
        password: "password123",
        firstName: "Simeon",
        lastName: "Sitrakiniaina",
        role: "ADMIN",
        farmId: farm.id,
      },
      {
        email: "comptable@agriconnect.com",
        password: "password123",
        firstName: "Lesoa",
        lastName: "Asandratra",
        role: "COMPTABLE",
        farmId: farm.id,
      },
      {
        email: "ouvrier@agriconnect.com",
        password: "password123",
        firstName: "Voahary",
        lastName: "Radoniaina",
        role: "OUVRIER",
        farmId: farm.id,
      },
    ],
  });

  console.log(`${users.count} utilisateurs insérés !`);
  console.log("Seeding terminé avec succès !");
}

main()
  .catch((e) => {
    console.error(" Erreur lors de l'insertion :", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });