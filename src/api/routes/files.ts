import type { Context } from "elysia";
import { STATUS_ERR } from "../../constants";
import { BunFile } from "bun";

import {
  createRelease,
  getReleaseFile,
  getAllReleaseFiles,
  deleteRelease,
  deleteAllPluginReleases,
} from "../../services/releaseFileService";

// 1. Создать новый релиз (и папку плагина, если её нет)
export const createReleaseFileHandler = async ({
  params,
  body,
  set,
}: Context) => {
  try {
    const { pluginId, releaseId, filename } = params;
    const { file } = body as { file: BunFile };
    if (!file || !filename) {
      set.status = 400;
      return { error: "No file or filename provided" };
    }
    const filePath = await createRelease(pluginId, releaseId, file, filename);
    return { filePath };
  } catch (error) {
    set.status = 500;
    return { error: error instanceof Error ? error.message : STATUS_ERR };
  }
};

// 2. Получить файл релиза по айди релиза
export const getReleaseFileHandler = async ({ params, set }: Context) => {
  try {
    const { pluginId, releaseId, filename } = params;
    const file = await getReleaseFile(pluginId, releaseId, filename);
    if (!file) {
      set.status = 404;
      return { error: "File not found" };
    }
    set.headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    return file;
  } catch (error) {
    set.status = 500;
    return { error: error instanceof Error ? error.message : STATUS_ERR };
  }
};

// 3. Получить все файлы релизов плагина
export const getAllReleaseFilesHandler = async ({ params, set }: Context) => {
  try {
    const { pluginId } = params;
    const files = await getAllReleaseFiles(pluginId);
    return { files };
  } catch (error) {
    set.status = 500;
    return { error: error instanceof Error ? error.message : STATUS_ERR };
  }
};

// 4. Удалить конкретный релиз
export const deleteReleaseFileHandler = async ({ params, set }: Context) => {
  try {
    const { pluginId, releaseId } = params;
    const ok = await deleteRelease(pluginId, releaseId);
    if (!ok) {
      set.status = 404;
      return { error: "Release not found" };
    }
    return { success: true };
  } catch (error) {
    set.status = 500;
    return { error: error instanceof Error ? error.message : STATUS_ERR };
  }
};

// 5. Удалить все релизы и папку плагина
export const deleteAllPluginReleasesHandler = async ({
  params,
  set,
}: Context) => {
  try {
    const { pluginId } = params;
    const ok = await deleteAllPluginReleases(pluginId);
    if (!ok) {
      set.status = 404;
      return { error: "Plugin folder not found" };
    }
    return { success: true };
  } catch (error) {
    set.status = 500;
    return { error: error instanceof Error ? error.message : STATUS_ERR };
  }
};
