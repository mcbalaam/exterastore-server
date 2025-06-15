import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'
import { updateLogFile, start, clearSession } from "./lib/logger";

const app = new Elysia()
	.use(bearer())
	.get("/", () => "Hello Elysia")
	.get(`/api/v1/:s1`, (ctx) => { // может быть plugins, users, stats
		const { s1 } = ctx.params; // Получаем параметр s1
		return `api with s1: ${s1}`;
	})
	.listen(3000);

start()


updateLogFile("generic", `Server started at ${app.server?.hostname}:${app.server?.port}`)

console.log(`[INIT] Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

process.on('SIGINT', () => {
  console.log('\n[INFO] The server is halting...');
	updateLogFile("generic", `Server halted.`)
  clearSession();
  process.exit(0);
});
