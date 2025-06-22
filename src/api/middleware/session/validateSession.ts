import { Elysia } from "elysia";
import prisma from "../../../lib/prisma";

export const validateSession = new Elysia({ name: "create-new-session" }).onBeforeHandle(
  async ({ set, cookie }) => {
		const sessionId = cookie.sessionId?.value;

		if (!sessionId) {
			set.status = 401;
			return "Unauthorized request";
		}

		const activeSession = await prisma.activeSessions.findUnique({
			where: { sessionId: sessionId },
		})

		if (!activeSession || !sessionId) {
			set.status = 401;
			return "Your session has expired or never was even there";
		}
	})