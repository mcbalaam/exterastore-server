import { Elysia } from "elysia";

export const masterKeyAuth = new Elysia({ name: "master-key-auth" })
  .onBeforeHandle(({ set, request }) => {
    const authHeader = request.headers.get("authorization");
    const masterKey = process.env.MASTER_API_KEY;

    if (!masterKey) {
      set.status = 500;
      throw new Error("Master key not configured");
    }

    if (authHeader === `Bearer ${masterKey}`) {
      return;
    }

    set.status = 401;
    return { error: "Invalid master key" };
  });

