import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const PORT = process.env.PORT || 3001;

const app = new Elysia()
  .get("/plugins", async () => {
    return await prisma.plugin.findMany();
  })
  .post("/plugins", async ({ body }) => {
    return await prisma.plugin.create({
      data: body as any,
    });
  })
  .listen(PORT);

console.log(`plugin-service running on port ${PORT}`);
