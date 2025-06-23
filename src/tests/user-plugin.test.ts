import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import userService from "../services/userService";
import pluginService from "../services/pluginService";
import { Elysia } from "elysia";
import { pluginsGetHandler } from "../api/routes/plugins";

const app = new Elysia().get("/plugins/:id", pluginsGetHandler);

describe("User + Plugin integration", () => {
	let userId: string;
	let pluginId: string;

	it("создаёт пользователя напрямую через сервис", async () => {
		const user = await userService.create({
			telegramId: "test_telegram_id",
			username: "testuser123",
			passwordHash: "testpasswordhash123",
			profilePicture: ""
		});
		expect(user).toHaveProperty("id");
		userId = user.id;
	});

	it("создаёт плагин напрямую через сервис", async () => {
		const pluginName = "plug" + Math.floor(Math.random() * 10000);
		const plugin = await pluginService.createPlugin(
			pluginName,
			"MIT",
			"generic description"
		);

		if (typeof plugin === "string") {
			throw new Error(`Ошибка создания плагина: ${plugin}`);
		}
		expect(plugin).toHaveProperty("id");
		pluginId = plugin.id;
	});

	it("получает информацию о плагине через сервис", async () => {
		const plugin = await pluginService.getPluginById(pluginId);
		expect(plugin).not.toBeNull();
		expect(plugin.id).toBe(pluginId);
	});

	it("получает информацию о плагине через API", async () => {
		const req = new Request(`http://localhost/plugins/${pluginId}`);
		const res = await app.handle(req);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.id).toBe(pluginId);
	});

	it("удаляет плагин через сервис", async () => {
		const result = await pluginService.deletePlugin(pluginId);
		expect(result).toHaveProperty("id", pluginId);
	});

	it("удаляет пользователя через сервис", async () => {
		const result = await userService.remove(userId);
		expect(result).toHaveProperty("id", userId);
	});
});
