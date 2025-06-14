import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'
import { updateLogFile, start, clearSession } from "./lib/logger";

const app = new Elysia()
	.use(bearer())
	.get("/", () => "Hello Elysia",)
	.get("/api/v1", () => "api",)
	.listen(3000);

start()


updateLogFile("generic", `Server started at ${app.server?.hostname}:${app.server?.port}`)

console.log(`[INIT] Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

process.on('SIGINT', () => {
  console.log('\n[INFO] The server is halting...');
  clearSession();
  process.exit(0);
});
