import { mkdir, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { BunFile } from "bun";
import LOGGER_SESSION from "../lib/logger";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

export async function createRelease(
  pluginId: string,
  releaseId: string,
  file: BunFile,
  filename: string,
) {
  const pluginDir = path.join(STORAGE_ROOT, pluginId);
  const releaseDir = path.join(pluginDir, releaseId);

  if (!existsSync(pluginDir)) {
    await mkdir(pluginDir, { recursive: true });
  }

  if (!existsSync(releaseDir)) {
    await mkdir(releaseDir, { recursive: true });
  }

  const filePath = path.join(STORAGE_ROOT, pluginId, releaseId, filename);
  const dirPath = path.dirname(filePath);
  try {
    await mkdir(dirPath, { recursive: true });
    await Bun.write(filePath, file);
  } catch (e) {
    console.error("Ошибка создания файла релиза:", e);
  }
  return filePath;
}

export async function getReleaseFile(
  pluginId: string,
  releaseId: string,
  filename: string,
): Promise<BunFile | null> {
  const filePath = path.join(STORAGE_ROOT, pluginId, releaseId, filename);
  if (!existsSync(filePath)) return null;
  return Bun.file(filePath);
}

export async function getAllReleaseFiles(pluginId: string): Promise<string[]> {
  const pluginDir = path.join(STORAGE_ROOT, pluginId);
  if (!existsSync(pluginDir)) {
    console.error(`[ERROR] Папка плагина не найдена: ${pluginDir}`);
    return [];
  }

  let releaseDirs;
  try {
    releaseDirs = await readdir(pluginDir, { withFileTypes: true });
  } catch (error: any) {
    console.error(
      `[ERROR] Не удалось прочитать папку плагина ${pluginDir}:`,
      error,
    );
    LOGGER_SESSION.log("error", error);
    return [];
  }

  const files: string[] = [];
  for (const dirent of releaseDirs) {
    if (dirent.isDirectory()) {
      const releaseDir = path.join(pluginDir, dirent.name);
      let releaseFiles;
      try {
        releaseFiles = await readdir(releaseDir);
      } catch (e: any) {
        console.error(
          `[ERROR] Не удалось прочитать папку релиза ${releaseDir}:`,
          e,
        );
        LOGGER_SESSION.log("error", e);
        continue;
      }
      for (const file of releaseFiles) {
        files.push(path.join(dirent.name, file));
      }
    } else {
      console.warn(
        `[WARN] Найден не-папка в директории плагина: ${dirent.name}`,
      );
    }
  }
  if (files.length === 0) {
    console.warn(`[WARN] Для плагина ${pluginId} не найдено файлов релизов`);
    LOGGER_SESSION.log("error", pluginId);
  }
  console.log(`[DEBUG] Файлы для плагина ${pluginId}:`, files);

  return files;
}

export async function deleteReleaseFile(pluginId: string, releaseId: string) {
  const releaseDir = path.join(STORAGE_ROOT, pluginId, releaseId);
  if (existsSync(releaseDir)) {
    await rm(releaseDir, { recursive: true, force: true });
    return true;
  }
  return false;
}

export async function deleteAllPluginReleases(pluginId: string) {
  const pluginDir = path.join(STORAGE_ROOT, pluginId);
  if (existsSync(pluginDir)) {
    await rm(pluginDir, { recursive: true, force: true });
    return true;
  }
  return false;
}
