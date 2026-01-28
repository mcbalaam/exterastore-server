import { Elysia } from "elysia";
import { prisma } from "../lib/prisma";

import { _getUserById, _getUserByTelegramId, _getUserByUsername } from "../handlers/get";

const app = new Elysia()

app.group("/get", (app) =>
  app
    .get("/id", _getUserById)
    .get("/tgid", _getUserByTelegramId)
    .get("/username", _getUserByUsername)

);
