import { STATUS_ERR } from "../lib/constants";
import logger from "../lib/logger";
import { prisma } from "../lib/prisma";

export async function getPluginById(pluginId: string) {
	try {
		const plugin = await prisma.plugin.findUnique({
			where: { id: pluginId },
		});

		if (!plugin) {
			throw new Error(`Plugin with ID ${pluginId} not found`);
		}

		return plugin;
	} catch (error) {
		logger.error(`Unable to fetch plugin ID ${pluginId}: ${error}`);
		throw error;
	}
}

export async function getAllPlugins() {
	try {
		const plugins = await prisma.plugin.findMany({
			include: {
				releases: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return plugins.length ? plugins : [];
	} catch (error) {
		logger.error(`Unable to fetch all plugins: ${error}`);
		throw error;
	}
}

export async function getLatestReleaseForPluginId(pluginId: string) {
	try {
		const release = await prisma.pluginRelease.findFirst({
			where: { pluginId },
			orderBy: { createdAt: "desc" },
		});

		if (!release) {
			logger.error(`No releases for the following plugin ID: ${pluginId}`);
			return STATUS_ERR;
		}

		return release;
	} catch (error) {
		logger.error(
			`Unable to fetch latest release for plugin ID ${pluginId}: ${error}`,
		);
		throw error;
	}
}

export async function getAllPluginNames() {
	try {
		return await prisma.plugin.findMany({
			select: {
				name: true,
			},
			orderBy: {
				name: "asc",
			},
		});
	} catch (error) {
		logger.error(`Unable to fetch all plugin names: ${error}`);
		throw error;
	}
}

export async function countStuff() {
	try {
		return {
			plugins: await prisma.plugin.count(),
			releases: await prisma.pluginRelease.count(),
		};
	} catch (error) {
		logger.error(`Unable to count plugins and releases: ${error}`);
		throw error;
	}
}
