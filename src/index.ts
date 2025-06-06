import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'

const app = new Elysia()
	.use(bearer())
	.get("/", () => "Hello Elysia",)
	.get("/api/v1", () => "api",)
	.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
