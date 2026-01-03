import {
	isValidTag,
	STATUS_CIRCULAR_DEPENDENCY,
	STATUS_DEPENDENCY_NOT_FOUND,
	STATUS_ERR,
	STATUS_FORK_NOT_FOUND,
	STATUS_INVALID_AUTHOR,
	STATUS_INVALID_DESCRIPTION,
	STATUS_INVALID_LICENSE,
	STATUS_INVALID_NAME,
	STATUS_INVALID_PLATFORM,
	STATUS_INVALID_TAGS,
	STATUS_SELF_DEPENDENCY,
	type Tag,
	validateTags,
} from "../lib/constants";
import logger from "../lib/logger";
import { prisma } from "../lib/prisma";
import { userClient } from "../lib/userClient";
import { SCHEMA_DESCRIPTION, SCHEMA_PLUGINNAME } from "../lib/validation";

const VALID_PLATFORMS = ["Extera", "AltUI"] as const;
const VALID_LICENSES = [
	"MIT",
	"Apache-2.0",
	"GPL-3.0",
	"BSD-3-Clause",
	"ISC",
	"Custom",
] as const;

async function checkCircularDependency(
	pluginId: string,
	newDependencyId: string,
	visited: Set<string> = new Set(),
): Promise<boolean> {
	if (visited.has(newDependencyId)) {
		return false;
	}

	if (newDependencyId === pluginId) {
		return true;
	}

	visited.add(newDependencyId);

	const dependencies = await prisma.pluginDependency.findMany({
		where: {
			dependentPluginId: newDependencyId,
		},
		select: {
			dependencyPluginId: true,
		},
	});

	for (const dep of dependencies) {
		const hasCycle = await checkCircularDependency(
			pluginId,
			dep.dependencyPluginId,
			new Set(visited),
		);

		if (hasCycle) {
			return true;
		}
	}

	return false;
}

async function validateDependenciesForCycles(
	pluginId: string,
	dependencyIds: string[],
): Promise<{ valid: boolean; cyclicDependency?: string }> {
	for (const depId of dependencyIds) {
		const hasCycle = await checkCircularDependency(pluginId, depId);

		if (hasCycle) {
			return {
				valid: false,
				cyclicDependency: depId,
			};
		}
	}

	return { valid: true };
}

export async function createPlugin(
	name: string,
	license: string,
	authorId: string,
	targetPlatform: string[],
	tags?: string[],
	dependenciesById?: string[],
	description?: string,
	forkOriginId?: string,
) {
	try {
		const { error: nameError } = SCHEMA_PLUGINNAME.validate(name);
		if (nameError) {
			logger.error("Invalid plugin name", { error: nameError.message, name });
			return STATUS_INVALID_NAME;
		}

		if (description) {
			const { error: descError } = SCHEMA_DESCRIPTION.validate(description);
			if (descError) {
				logger.error("Invalid description", { error: descError.message });
				return STATUS_INVALID_DESCRIPTION;
			}
		}

		const authorExists = await userClient.validateUser(authorId);
		if (!authorExists) {
			logger.error("Author not found", { authorId });
			return STATUS_INVALID_AUTHOR;
		}

		if (!VALID_LICENSES.includes(license as any)) {
			logger.error("Invalid license", {
				license,
				validLicenses: VALID_LICENSES,
			});
			return STATUS_INVALID_LICENSE;
		}

		const validPlatforms = targetPlatform.every((p) =>
			VALID_PLATFORMS.includes(p as any),
		);
		if (!validPlatforms || targetPlatform.length === 0) {
			logger.error("Invalid target platforms", {
				provided: targetPlatform,
				valid: VALID_PLATFORMS,
			});
			return STATUS_INVALID_PLATFORM;
		}

		let validatedTags: string[] = [];
		if (tags && tags.length > 0) {
			const uniqueTags = [...new Set(tags)];
			validatedTags = validateTags(uniqueTags);

			if (validatedTags.length !== uniqueTags.length) {
				const invalidTags = uniqueTags.filter((t) => !isValidTag(t));
				logger.error("Invalid tags provided", {
					invalidTags,
					validTags: validatedTags,
				});
				return {
					...STATUS_INVALID_TAGS,
					invalidTags,
					validTags: validatedTags,
				};
			}
		}

		if (forkOriginId) {
			const originPlugin = await prisma.plugin.findUnique({
				where: { id: forkOriginId },
				select: {
					id: true,
					tags: true,
					targetPlatform: true,
				},
			});

			if (!originPlugin) {
				logger.error("Fork origin plugin not found", { forkOriginId });
				return STATUS_FORK_NOT_FOUND;
			}

			if (originPlugin.tags) {
				if (validatedTags.length === 0 && originPlugin.tags.length > 0) {
					validatedTags = originPlugin.tags;
					logger.info("Tags copied from fork origin", { tags: validatedTags });
				}
			}
		}

		let validatedDependencies: string[] = [];
		if (dependenciesById && dependenciesById.length > 0) {
			const uniqueDeps = [...new Set(dependenciesById)];

			// Проверка: плагин не может зависеть сам от себя (будет проверено при создании)
			// Эта проверка будет выполнена после создания плагина в транзакции

			const dependencies = await prisma.plugin.findMany({
				where: {
					id: { in: uniqueDeps },
				},
				select: { id: true, name: true },
			});

			if (dependencies.length !== uniqueDeps.length) {
				const foundIds = dependencies.map((d) => d.id);
				const notFound = uniqueDeps.filter((id) => !foundIds.includes(id));
				logger.error("Some dependencies not found", { notFound });
				return {
					...STATUS_DEPENDENCY_NOT_FOUND,
					notFoundIds: notFound,
				};
			}

			validatedDependencies = uniqueDeps;
		}

		const plugin = await prisma.$transaction(async (tx) => {
			const newPlugin = await tx.plugin.create({
				data: {
					name,
					description,
					license,
					authorId,
					targetPlatform,
					tags: validatedTags,
					forkOriginId,
				},
				include: {
					forkOrigin: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			if (validatedDependencies.includes(newPlugin.id)) {
				logger.error("Plugin cannot depend on itself", {
					pluginId: newPlugin.id,
				});
				throw new Error("SELF_DEPENDENCY");
			}

			// ПРОВЕРКА: Циклические зависимости
			if (validatedDependencies.length > 0) {
				const cycleCheck = await validateDependenciesForCycles(
					newPlugin.id,
					validatedDependencies,
				);

				if (!cycleCheck.valid) {
					logger.error("Circular dependency detected", {
						pluginId: newPlugin.id,
						cyclicDependency: cycleCheck.cyclicDependency,
					});
					throw new Error("CIRCULAR_DEPENDENCY");
				}

				await tx.pluginDependency.createMany({
					data: validatedDependencies.map((depId) => ({
						dependentPluginId: newPlugin.id,
						dependencyPluginId: depId,
					})),
				});
			}

			return await tx.plugin.findUnique({
				where: { id: newPlugin.id },
				include: {
					forkOrigin: {
						select: {
							id: true,
							name: true,
						},
					},
					dependencies: {
						include: {
							dependencyPlugin: {
								select: {
									id: true,
									name: true,
									description: true,
								},
							},
						},
					},
				},
			});
		});

		logger.info("Plugin created successfully", {
			pluginId: plugin?.id,
			name: plugin?.name,
			authorId,
			tagsCount: validatedTags.length,
			tags: validatedTags,
			dependenciesCount: validatedDependencies.length,
			isFork: !!forkOriginId,
		});

		return plugin;
	} catch (error: any) {
		if (error.message === "SELF_DEPENDENCY") {
			return STATUS_SELF_DEPENDENCY;
		}

		if (error.message === "CIRCULAR_DEPENDENCY") {
			return STATUS_CIRCULAR_DEPENDENCY;
		}

		if (error.code === "P2002") {
			logger.error("Plugin name already exists", { name });
			return {
				error: "Plugin with this name already exists",
				code: "DUPLICATE_NAME",
			};
		}

		logger.error("Failed to create plugin", error);
		return STATUS_ERR;
	}
}

export async function createPluginWithDependencies(
	name: string,
	license: string,
	authorId: string,
	targetPlatform: string[],
	dependencies?: Array<{
		pluginId: string;
		version?: string;
	}>,
	tags?: Tag[],
	description?: string,
	forkOriginId?: string,
) {
	try {
		const { error: nameError } = SCHEMA_PLUGINNAME.validate(name);
		if (nameError) {
			logger.error("Invalid plugin name", { error: nameError.message });
			return STATUS_INVALID_NAME;
		}

		if (description) {
			const { error: descError } = SCHEMA_DESCRIPTION.validate(description);
			if (descError) {
				logger.error("Invalid description", { error: descError.message });
				return STATUS_INVALID_DESCRIPTION;
			}
		}

		const authorExists = await userClient.validateUser(authorId);
		if (!authorExists) {
			logger.error("Author not found", { authorId });
			return STATUS_INVALID_AUTHOR;
		}

		if (!VALID_LICENSES.includes(license as any)) {
			logger.error("Invalid license", { license });
			return STATUS_INVALID_LICENSE;
		}

		const validPlatforms = targetPlatform.every((p) =>
			VALID_PLATFORMS.includes(p as any),
		);
		if (!validPlatforms || targetPlatform.length === 0) {
			logger.error("Invalid target platforms", { targetPlatform });
			return STATUS_INVALID_PLATFORM;
		}

		let validatedTags: Tag[] = [];
		if (tags && tags.length > 0) {
			validatedTags = validateTags(tags);
			if (validatedTags.length !== tags.length) {
				logger.error("Invalid tags", { tags });
				return STATUS_INVALID_TAGS;
			}
		}

		if (forkOriginId) {
			const originPlugin = await prisma.plugin.findUnique({
				where: { id: forkOriginId },
			});

			if (!originPlugin) {
				logger.error("Fork origin not found", { forkOriginId });
				return STATUS_FORK_NOT_FOUND;
			}
		}

		if (dependencies && dependencies.length > 0) {
			const depIds = dependencies.map((d) => d.pluginId);

			const existingPlugins = await prisma.plugin.findMany({
				where: { id: { in: depIds } },
				select: { id: true },
			});

			if (existingPlugins.length !== depIds.length) {
				const foundIds = existingPlugins.map((p) => p.id);
				const notFound = depIds.filter((id) => !foundIds.includes(id));
				logger.error("Dependencies not found", { notFound });
				return STATUS_DEPENDENCY_NOT_FOUND;
			}
		}

		const plugin = await prisma.$transaction(async (tx) => {
			const newPlugin = await tx.plugin.create({
				data: {
					name,
					description,
					license,
					authorId,
					targetPlatform,
					tags: validatedTags,
					forkOriginId,
				},
				include: {
					forkOrigin: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			if (dependencies && dependencies.length > 0) {
				const depIds = dependencies.map((d) => d.pluginId);

				if (depIds.includes(newPlugin.id)) {
					logger.error("Plugin cannot depend on itself", {
						pluginId: newPlugin.id,
					});
					throw new Error("SELF_DEPENDENCY");
				}

				const cycleCheck = await validateDependenciesForCycles(
					newPlugin.id,
					depIds,
				);

				if (!cycleCheck.valid) {
					logger.error("Circular dependency detected", {
						pluginId: newPlugin.id,
						cyclicDependency: cycleCheck.cyclicDependency,
					});
					throw new Error("CIRCULAR_DEPENDENCY");
				}

				await tx.pluginDependency.createMany({
					data: dependencies.map((dep) => ({
						dependentPluginId: newPlugin.id,
						dependencyPluginId: dep.pluginId,
						version: dep.version,
					})),
				});
			}

			return await tx.plugin.findUnique({
				where: { id: newPlugin.id },
				include: {
					dependencies: {
						include: {
							dependencyPlugin: {
								select: {
									id: true,
									name: true,
									description: true,
								},
							},
						},
					},
					forkOrigin: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
		});

		logger.info("Plugin created with dependencies", {
			pluginId: plugin?.id,
			name,
			dependenciesCount: dependencies?.length || 0,
		});

		return plugin;
	} catch (error: any) {
		if (error.message === "SELF_DEPENDENCY") {
			return STATUS_SELF_DEPENDENCY;
		}

		if (error.message === "CIRCULAR_DEPENDENCY") {
			return STATUS_CIRCULAR_DEPENDENCY;
		}

		if (error.code === "P2002") {
			logger.error("Duplicate plugin name", { name });
			return { error: "Plugin name already exists", code: "DUPLICATE_NAME" };
		}

		logger.error("Failed to create plugin", error);
		return STATUS_ERR;
	}
}

export async function addDependencyToPlugin(
	pluginId: string,
	dependencyPluginId: string,
	version?: string,
) {
	try {
		if (pluginId === dependencyPluginId) {
			logger.error("Plugin cannot depend on itself", { pluginId });
			return STATUS_SELF_DEPENDENCY;
		}

		const [plugin, dependencyPlugin] = await Promise.all([
			prisma.plugin.findUnique({ where: { id: pluginId } }),
			prisma.plugin.findUnique({ where: { id: dependencyPluginId } }),
		]);

		if (!plugin) {
			return { error: "Plugin not found", code: "PLUGIN_NOT_FOUND" };
		}

		if (!dependencyPlugin) {
			return STATUS_DEPENDENCY_NOT_FOUND;
		}

		const hasCycle = await checkCircularDependency(
			pluginId,
			dependencyPluginId,
		);
		if (hasCycle) {
			logger.error("Circular dependency detected", {
				pluginId,
				dependencyPluginId,
			});
			return STATUS_CIRCULAR_DEPENDENCY;
		}

		const dependency = await prisma.pluginDependency.create({
			data: {
				dependentPluginId: pluginId,
				dependencyPluginId,
				version,
			},
			include: {
				dependencyPlugin: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
			},
		});

		logger.info("Dependency added", {
			pluginId,
			dependencyPluginId,
			version,
		});

		return dependency;
	} catch (error: any) {
		if (error.code === "P2002") {
			return {
				error: "Dependency already exists",
				code: "DUPLICATE_DEPENDENCY",
			};
		}

		logger.error("Failed to add dependency", error);
		return STATUS_ERR;
	}
}
