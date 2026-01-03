import { Elysia } from "elysia";
import { prisma } from "../lib/prisma";

export const healthRoutes = new Elysia()
  .get("/health", async ({ set }) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      
      return {
        status: "ok",
        service: "plugin-service",
        timestamp: new Date().toISOString(),
        database: "connected"
      };
    } catch (error) {
      set.status = 503;
      return {
        status: "error",
        service: "plugin-service",
        timestamp: new Date().toISOString(),
        database: "disconnected"
      };
    }
  });
