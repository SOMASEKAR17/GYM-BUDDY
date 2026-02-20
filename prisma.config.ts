import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.USE_PROD_DB === "true" ? process.env.PROD_DATABASE_URL! : process.env.DATABASE_URL!,
  },
});
