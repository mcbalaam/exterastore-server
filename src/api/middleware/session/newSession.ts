import { Elysia } from "elysia";
import prisma from "../../../lib/prisma";

export const newSession = new Elysia({ name: "create-new-session" }).post("/newsession",
  async ({ body, set, cookie }) => {
    const { username, passwordHash } = body as {
      username: string;
      passwordHash: string;
    };

    const user = await prisma.user.findUnique({
      where: { username: username },
    });

		if (!user || user.passwordHash !== passwordHash) {
      set.status = 401;
			return "Username or password incorrect"
    }

		const newSession = await prisma.activeSessions.create({
			data: {
				userId: user.id // sessionId сам создаётся
			}
		})

		const sessionId = newSession.sessionId;

		set.status = 200;
		cookie.sessionId.set({
			value: sessionId,
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 24 * 7
    });
		return newSession.sessionId;
  }
);
