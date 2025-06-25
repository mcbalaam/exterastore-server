import { describe, it, expect, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { Elysia } from "elysia";
import {
  pluginsGetHandler,
  pluginsReleasesHandler,
} from "../api/routes/plugins";
import { releasesGetHandler } from "../api/routes/releases";

import fs from "fs"

import {
  create as createUser,
  remove as removeUser,
} from "../services/userService";
import {
  createPlugin,
  deletePlugin,
  getLatestReleaseForPluginId,
} from "../services/pluginService";
import {
  createRelease,
  getReleaseFileById,
  getAllReleaseFilesForPlugin,
  fullyDeleteRelease,
  deleteAllReleasesForPlugin,
} from "../services/releaseService";
import { getAllReleaseFiles } from "../services/releaseFileService";

const app = new Elysia()
  .get("/plugins/:id", pluginsGetHandler)
  .get("/plugins/:id/releases", pluginsReleasesHandler)
  .get("/releases/:id", releasesGetHandler);

describe("User + Plugin + Release integration", () => {
  let userId: string;
  let pluginId: string;
  let releaseId: string;
  let pluginName = "plug" + Math.floor(Math.random() * 10000);
  let releaseHash = "testhash123";
  let fileReference: string;
  let filePath: string;
  let releaseDir: string;

  // 1. Создать пользователя через сервис
  it("создаёт пользователя", async () => {
    const user = await createUser({
      telegramId: "test_telegram_id_" + Date.now(),
      username: "testuser" + Math.floor(Math.random() * 10000),
      passwordHash: "testpasswordhash123",
      profilePicture: "",
    });
    expect(user).toHaveProperty("id");
    userId = user.id;
  });

  // 2. Создать плагин через сервис
  it("создаёт плагин", async () => {
    const plugin = await createPlugin(pluginName, "MIT", "integration test");
    if (typeof plugin === "string")
      throw new Error("Ошибка создания плагина: " + plugin);
    expect(plugin).toHaveProperty("id");
    pluginId = plugin.id;
  });

  // 3. Создать запись релиза в БД, затем файл по правильному пути
  it("создаёт релиз с файлом через сервис", async () => {
    fileReference = "test-release-" + Date.now() + ".zip";

    // 3.1. Сначала создаём запись релиза в БД (чтобы узнать releaseId)
    const release = await createRelease(
      pluginId,
      fileReference, // только имя файла
      releaseHash,
      "Release for integration test"
    );
    if (typeof release === "string")
      throw new Error("Ошибка создания релиза: " + release);
    expect(release).toHaveProperty("id");
    releaseId = release.id;

    // 3.2. Теперь создаём папку и файл с использованием releaseId из БД
    releaseDir = path.join("storage", pluginId, releaseId);
    filePath = path.join(releaseDir, fileReference);

    mkdirSync(releaseDir, { recursive: true });
    writeFileSync(filePath, Buffer.from("This is a test release file content"));
  });

  // 4. Получить данные плагина через API
  it("получает данные плагина через API", async () => {
    const req = new Request(`http://localhost/plugins/${pluginId}`);
    const res = await app.handle(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(pluginId);
  });

  // 5. Получить данные релиза через API
  it("получает данные релиза через API", async () => {
    const req = new Request(`http://localhost/releases/${releaseId}`);
    const res = await app.handle(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(releaseId);
  });

  // 6. Получить все релизы плагина через API
  it("получает все релизы плагина через API", async () => {
    const req = new Request(`http://localhost/plugins/${pluginId}/releases`);
    const res = await app.handle(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.find((r: any) => r.id === releaseId)).toBeTruthy();
  });

  // 7. Получить последний релиз плагина через сервис
  it("получает последний релиз плагина через сервис", async () => {
    const latest = await getLatestReleaseForPluginId(pluginId);
    if (typeof latest === "string")
      throw new Error("Ошибка получения релиза: " + latest);
    expect(latest.id).toBe(releaseId);
  });

  // 8. Получить файл релиза через releaseService
  it("получает файл релиза через releaseService", async () => {
		expect(fs.existsSync(filePath)).toBe(true);
    // fileReference — имя файла, releaseId — из БД
    const file = await getReleaseFileById(releaseId, fileReference);
    expect(file).not.toBeNull();
    // Проверим, что файл действительно существует на диске
    expect(existsSync(filePath)).toBe(true);
  });

  // 9. Получить все файлы релизов плагина через releaseService
  it("получает все файлы релизов плагина через releaseService", async () => {
    const files = await getAllReleaseFilesForPlugin(pluginId);
    expect(Array.isArray(files)).toBe(true);
    expect(files.find((f) => f.includes(fileReference))).toBeTruthy();
  });

  // 10. Удалить релиз, плагин и пользователя через сервисы, а также файл
  afterAll(async () => {
    if (releaseId) await fullyDeleteRelease(releaseId);
    if (pluginId) await deletePlugin(pluginId);
    if (userId) await removeUser(userId);
    // Удалить физический файл и папку релиза (если остались)
    try {
      if (existsSync(filePath)) rmSync(filePath);
      if (existsSync(releaseDir))
        rmSync(releaseDir, { recursive: true, force: true });
    } catch (e) {
      // Игнорируем ошибки удаления
    }
  });
});
