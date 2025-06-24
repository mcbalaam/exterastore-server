import prisma from "../lib/prisma";
import LOGGER_SESSION from "..";
import { STATUS_ERR } from "../constants";
import { getReleaseFile, getAllReleaseFiles, deleteAllPluginReleases } from "./releaseFileService";

export async function createRelease(
	pluginId: string,
	fileReference: string,
	releaseHash: string,
	releaseNotes?: string
) {
	try {
		// Проверка существования плагина
		const plugin = await prisma.exteraPlugin.findUnique({ where: { id: pluginId } });
		if (!plugin) throw new Error(`Plugin with ID ${pluginId} not found`);

		// Создание записи релиза в БД
		const release = await prisma.pluginRelease.create({
			data: {
				releaseNotes,
				file: fileReference,
				pluginId,
				releaseHash,
				downloads: 0
			}
		});

		LOGGER_SESSION.log("generic", `Uploaded new release for plugin ${pluginId}: ${release.id}`);
		return release;
	} catch (error) {
		LOGGER_SESSION.log("error", `Unable to create new release for plugin ID ${pluginId}: ${error}`);
		return STATUS_ERR;
	}
}

// 2. Получить файл релиза по айди релиза
export async function getReleaseFileById(releaseId: string, filename: string) {
	try {
		const release = await prisma.pluginRelease.findUnique({
			where: { id: releaseId }
		});
		if (!release) throw new Error(`Release with ID ${releaseId} not found`);
		// pluginId и releaseId нужны для поиска файла
		return await getReleaseFile(release.pluginId, releaseId, filename);
	} catch (error) {
		LOGGER_SESSION.log("error", `Release file fetch error: ${error}`);
		throw error;
	}
}

// 3. Получить все файлы релизов плагина
export async function getAllReleaseFilesForPlugin(pluginId: string) {
	try {
		return await getAllReleaseFiles(pluginId);
	} catch (error) {
		LOGGER_SESSION.log("error", `Couldn't fetch release files for ${pluginId}: ${error}`);
		throw error;
	}
}

// 4. Удалить конкретный релиз (файлы + запись в БД)
export async function fullyDeleteRelease(releaseId: string) {
	try {
		const release = await prisma.pluginRelease.findUnique({
			where: { id: releaseId }
		});
		if (!release) throw new Error(`Release with ID ${releaseId} not found`);

		// Удаляем файлы релиза
		await deleteRelease(releaseId);

		// Удаляем запись из БД
		const deletedRelease = await prisma.pluginRelease.delete({
			where: { id: releaseId }
		});

		LOGGER_SESSION.log("generic", `Deleted release ${releaseId}`);
		return deletedRelease;
	} catch (error) {
		LOGGER_SESSION.log("error", `Release deletion error: ${error}`);
		throw error;
	}
}

// 5. Удалить все релизы и папку плагина
export async function deleteAllReleasesForPlugin(pluginId: string) {
	try {
		// Удаляем все файлы релизов плагина
		await deleteAllPluginReleases(pluginId);

		// Удаляем все записи релизов из БД
		await prisma.pluginRelease.deleteMany({ where: { pluginId } });

		LOGGER_SESSION.log("generic", `Deleted all releases for plugin ${pluginId}`);
		return true;
	} catch (error) {
		LOGGER_SESSION.log("error", `Error deleting all releases for plugin ${pluginId}: ${error}`);
		throw error;
	}
}

export async function deleteRelease(releaseId: string) {
  try {
    const deletedRelease = await prisma.pluginRelease.delete({
      where: { id: releaseId },
    });

    LOGGER_SESSION.log("generic", `Deleted release ${releaseId}`);
    return deletedRelease;
  } catch (error) {
    console.error("Release deletion error:", error);
    throw error;
  }
}

