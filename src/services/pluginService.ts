import prisma from "../lib/prisma";
import LOGGER_SESSION from "../lib/logger";
import {
  SCHEMA_PLUGINNAME,
  SCHEMA_DESCRIPTION,
  SCHEMA_RELEASENUMBER,
  SCHEMA_RELEASENOTES,
} from "../validation";
import {
  STATUS_ERR,
  STATUS_INVALID_DESCRIPTION,
  STATUS_INVALID_NAME,
} from "../constants";

export async function createPlugin(
  name: string,
  license: string,
  description?: string
) {
  try {
    const { error } = SCHEMA_PLUGINNAME.validate(name);
    if (error) {
      LOGGER_SESSION.log("error", `Invalid plugin name: ${error.message}`);
      return STATUS_INVALID_NAME;
    }

    if (description) {
      const { error } = SCHEMA_DESCRIPTION.validate(description);
      if (error) {
        LOGGER_SESSION.log("error", `Invalid description: ${error.message}`);
        console.log(error?.message);
        return STATUS_INVALID_DESCRIPTION;
      }
    }

    const plugin = await prisma.exteraPlugin.create({
      data: {
        name,
        description,
        license,
      },
    });

    LOGGER_SESSION.log("generic", `Created new plugin: ${plugin.id}`);
    return plugin;
  } catch (error) {
    LOGGER_SESSION.log("error", `Prisma error: ${error}`);
    return STATUS_ERR;
  }
}

export async function getPluginById(pluginId: string) {
  try {
    const plugin = await prisma.exteraPlugin.findUnique({
      where: { id: pluginId },
    });

    if (!plugin) {
      throw new Error(`Plugin with ID ${pluginId} not found`);
    }

    return plugin;
  } catch (error) {
    LOGGER_SESSION.log(
      "error",
      `Unable to fetch plugin ID ${pluginId}: ${error}`
    );
    throw error;
  }
}

export async function getAllPlugins() {
  try {
    const plugins = await prisma.exteraPlugin.findMany({
      include: {
        releases: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return plugins.length ? plugins : [];
  } catch (error) {
    LOGGER_SESSION.log("error", `Unable to fetch all plugins: ${error}`);
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
      LOGGER_SESSION.log(
        "error",
        `No releases for the following plugin ID: ${pluginId}`
      );
      return STATUS_ERR;
    }

    return release;
  } catch (error) {
    LOGGER_SESSION.log(
      "error",
      `Unable to fetch latest release for plugin ID ${pluginId}: ${error}`
    );
    throw error;
  }
}

export async function getAllPluginNames() {
  try {
    return await prisma.exteraPlugin.findMany({
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    LOGGER_SESSION.log("error", `Unable to fetch all plugin names: ${error}`);
    throw error;
  }
}

export async function countStuff() {
  try {
    return {
      plugins: await prisma.exteraPlugin.count(),
      releases: await prisma.pluginRelease.count(),
    };
  } catch (error) {
    LOGGER_SESSION.log(
      "error",
      `Unable to count plugins and releases: ${error}`
    );
    throw error;
  }
}

export async function updatePlugin(
  pluginId: string,
  name?: string,
  description?: string
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

    const updatedPlugin = await prisma.exteraPlugin.update({
      where: { id: pluginId },
      data: updateData,
    });

    LOGGER_SESSION.log("generic", `Updated plugin ${pluginId}`);
    return updatedPlugin;
  } catch (error) {
    LOGGER_SESSION.log("error", `Unable to update plugin data: ${error}`);
    throw error;
  }
}

export async function deletePlugin(pluginId: string) {
  try {
    await prisma.pluginRelease.deleteMany({
      where: { pluginId },
    });

    const deletedPlugin = await prisma.exteraPlugin.delete({
      where: { id: pluginId },
    });

    LOGGER_SESSION.log("generic", `Deleted plugin ${pluginId}`);
    return deletedPlugin;
  } catch (error) {
    LOGGER_SESSION.log(
      "error",
      `Unable to delete plugin for plugin ID ${pluginId}: ${error}`
    );
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
      LOGGER_SESSION.log(
        "error",
        `Non-existent releaseId request: ${releaseId}`
      );
      return STATUS_ERR;
    }

    return release;
  } catch (error) {
    LOGGER_SESSION.log("error", `Release fetch error: ${error}`);
    throw error;
  }
}

export async function getAllReleasesForPlugin(pluginId: string) {
  try {
    const releases = await prisma.pluginRelease.findMany({
      where: {
        pluginId: pluginId,
      },
    });

    return releases;
  } catch (error) {
    LOGGER_SESSION.log("error", `Couldn't fetch releases for ${pluginId}`);
    throw error;
  }
}

export async function getReactions(pluginId: string) {
  try {
    const plugin = await prisma.exteraPlugin.findUnique({
      where: { id: pluginId },
      select: {
        reactions: true,
      },
    });

    if (!plugin) {
      throw new Error(`Plugin with ID ${pluginId} not found`);
    }

    return plugin.reactions;
  } catch (error) {
    console.error("Error fetching reactions:", error);
    throw error;
  }
}

export async function getPluginStars(pluginId: string) {
  try {
    const starsCount = await prisma.pluginStars.count({
      where: { pluginId },
    });

    return starsCount;
  } catch (error) {
    console.error("Error fetching plugin stars:", error);
    throw error;
  }
}

export async function addPluginStar(userId: string, pluginId: string) {
  try {
    const star = await prisma.pluginStars.create({
      data: {
        userId,
        pluginId,
      },
    });

    return star;
  } catch (error) {
    console.error("Error adding plugin star:", error);
    throw error;
  }
}
