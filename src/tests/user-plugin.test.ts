import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { pluginsGetHandler } from "../api/routes/plugins";

import { create, remove } from "../services/userService";
import {
  createPlugin,
  getPluginById,
  deletePlugin,
} from "../services/pluginService";

const app = new Elysia().get("/plugins/:id", pluginsGetHandler);

describe("User + Plugin integration", () => {
  let userId: string;
  let pluginId: string;

  it("создаёт пользователя напрямую через сервис", async () => {
    const user = await create({
      telegramId: "test_telegram_id",
      username: "testuser123",
      passwordHash: "testpasswordhash123",
      profilePicture: "",
    });
    expect(user).toHaveProperty("id");
    userId = user.id;
  });

  it("создаёт плагин напрямую через сервис", async () => {
    const pluginName = "plug" + Math.floor(Math.random() * 10000);
    const plugin = await createPlugin(pluginName, "MIT", "generic description");

    if (typeof plugin === "string") {
      throw new Error(`Ошибка создания плагина: ${plugin}`);
    }
    expect(plugin).toHaveProperty("id");
    pluginId = plugin.id;
  });

  it("получает информацию о плагине через сервис", async () => {
    const plugin = await getPluginById(pluginId);
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
    const result = await deletePlugin(pluginId);
    expect(result).toHaveProperty("id", pluginId);
  });

  it("удаляет пользователя через сервис", async () => {
    const result = await remove(userId);
    expect(result).toHaveProperty("id", userId);
  });
});
