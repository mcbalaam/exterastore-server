import type { Context } from "elysia";
import prisma from "../../../lib/prisma";

export const validateSession = async ({ set, cookie }: Context) => {
	const sessionId = cookie.sessionId?.value;

	if (!sessionId) {
		set.status = 401;
		return { error: "Unauthorized request" };
	}

	const activeSession = await prisma.activeSessions.findUnique({
		where: { sessionId: sessionId },
	});

	if (!activeSession) {
		set.status = 401;
		return { error: "Your session has expired or never was even there" };
	}
};
