import { STATUS_ERR } from "../lib/constants";
import logger from "../lib/logger";
import { prisma } from "../lib/prisma";
import { SCHEMA_DESCRIPTION, SCHEMA_PLUGINNAME } from "../lib/validation";

export async function updatePlugin(
	pluginId: string,
	name?: string,
	description?: string,
) {
	try {
		const updateData: Record<string, any> = {};

		if (name) {
			const { error } = SCHEMA_PLUGINNAME.validate(name);
			if (error) throw new Error(`Invalid plugin name: ${error.message}`);
			updateData.name = name;
		}

		if (description !== undefined) {
			if (description) {
				const descError = SCHEMA_DESCRIPTION.validate(description).error;
				if (descError)
					throw new Error(`Invalid description: ${descError.message}`);
			}
			updateData.description = description;
		}

		const updatedPlugin = await prisma.plugin.update({
			where: { id: pluginId },
			data: updateData,
		});

		logger.info(`Updated plugin ${pluginId}`);
		return updatedPlugin;
	} catch (error) {
		logger.error(`Unable to update plugin data: ${error}`);
		throw error;
	}
}

export async function deletePlugin(pluginId: string) {
	try {
		await prisma.pluginRelease.deleteMany({
			where: { pluginId },
		});

		const deletedPlugin = await prisma.plugin.delete({
			where: { id: pluginId },
		});

		logger.info(`Deleted plugin ${pluginId}`);
		return deletedPlugin;
	} catch (error) {
		logger.error(`Unable to delete plugin for plugin ID ${pluginId}: ${error}`);
		throw error;
	}
}

export async function getReleaseById(releaseId: string) {
	try {
		const release = await prisma.pluginRelease.findUnique({
			where: { id: releaseId },
			include: {
				plugin: true,
			},
		});

		if (!release) {
			logger.error(`Non-existent releaseId request: ${releaseId}`);
			return STATUS_ERR;
		}

		return release;
	} catch (error) {
		logger.error(`Release fetch error: ${error}`);
		throw error;
	}
}

export async function getAllReleases(pluginId: string) {
	try {
		const releases = await prisma.pluginRelease.findMany({
			where: {
				pluginId: pluginId,
			},
		});

		return releases;
	} catch (error) {
		logger.error(`Couldn't fetch releases for ${pluginId}`);
		throw error;
	}
}
