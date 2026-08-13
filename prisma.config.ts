import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "postgresql://agriconnect:jerosalema666@localhost:5433/agriconnect-db?schema=public",
  },
});