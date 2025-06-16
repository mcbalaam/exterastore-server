import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'
import { loggerSession } from "./lib/logger";

const shouldLog: boolean = !process.argv.slice(3).includes('--no-logs');
const LOGGER_SESSION = new loggerSession(shouldLog);
export default LOGGER_SESSION;

const app = new Elysia()
	.use(bearer())
	.get(`/api/v1`, () => {
		return {motd: 'Hello from exteraStore :KakkoiWave:', lastUpdated: '16.06.25'}
	})
	.get(`/api/v1/:s1/:s2`, (ctx) => {
		const { s1, s2 } = ctx.params; 
		return `${s1}, ${s2}`;
	})
	.get(`/api/v1/:s1/:s2`, (ctx) => {
		const { s1, s2 } = ctx.params; 
		return `${s1}, ${s2}`;
	})
	.listen(3000);

LOGGER_SESSION.log("generic", `Server started at ${app.server?.hostname}:${app.server?.port}`)

console.log(`[INIT] Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

process.on('SIGINT', () => {
  console.log('\n[INFO] The server is halting...');
	LOGGER_SESSION.log("generic", `Server halted.`)
  process.exit(0);
});
