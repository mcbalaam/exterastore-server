import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'
import * as logger from './lib/logger'

const app = new Elysia()
	.use(bearer())
	.get("/", () => "Hello Elysia",)
	.get("/api/v1", () => "api",)
	.listen(3000);

logger.start()


logger.updateLogFile("generic", "hello")

console.log(`[INIT] Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

process.on('SIGINT', () => {
  console.log('\n[INFO] The server is halting...');
  logger.clearSession();
  process.exit(0);
});
