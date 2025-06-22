import { Elysia } from "elysia";
import prisma from "../../../lib/prisma";

export const expireSession = new Elysia({ name: "expire-session" }).post("/expiresession",
  async ({ set, cookie }) => {
    const userSession = cookie.sessionId?.value;

    if (!userSession) {
      return;
    }

    cookie.sessionId.set({
      value: "",
      maxAge: 0,
      path: "/",
    });

    try {
      await prisma.activeSessions.delete({ where: { sessionId: userSession } });
      set.status = 200;
    } catch (error) {
      set.status = 404;
      return { error: "Session not found" };
    }
  }
);
