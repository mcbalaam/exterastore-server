import prisma from "../lib/prisma";
import LOGGER_SESSION from "..";
import Joi from "joi";
import {
  STATUS_ERR,
  STATUS_INVALID_DESCRIPTION,
  STATUS_INVALID_NAME,
} from "../constants";
import { plugin } from "bun";

class PluginService {
  static nameSchema = Joi.string().min(5).max(15);
  static descriptionSchema = Joi.string().min(0).max(300);
  static releaseNumberSchema = Joi.string().min(3).max(9);
  static releaseNotesSchema = Joi.string().min(0).max(100);

  async createPlugin(name: string, description?: string) {
    try {
      const { error } = PluginService.nameSchema.validate(name);
      if (error) {
        LOGGER_SESSION.log("error", `Invalid plugin name: ${error.message}`);
        return STATUS_INVALID_NAME;
      }

      if (description) {
        const descError =
          PluginService.descriptionSchema.validate(description).error;
        if (descError)
          LOGGER_SESSION.log(
            "error",
            `Invalid description: ${descError.message}`
          );
        return STATUS_INVALID_DESCRIPTION;
      }

      const plugin = await prisma.exteraPlugin.create({
        data: {
          name,
          description,
        },
      });

      LOGGER_SESSION.log("generic", `Created new plugin: ${plugin.id}`);
      return plugin;
    } catch (error) {
      LOGGER_SESSION.log(
        "error",
        `Something went wrong while creating a new plugin! ${error}`
      );
      return STATUS_ERR;
    }
  }

  async createRelease(
    pluginId: string,
    fileReference: string,
    releaseHash: string,
    releaseNotes?: string
  ) {
    try {
      if (releaseNotes) {
        const { error } =
          PluginService.releaseNotesSchema.validate(releaseNotes);
        if (error) throw new Error(`Invalid release notes: ${error.message}`);
      }

      const plugin = await prisma.exteraPlugin.findUnique({
        where: { id: pluginId },
      });

      if (!plugin) {
        throw new Error(`Plugin with ID ${pluginId} not found`);
      }

      const release = await prisma.pluginRelease.create({
        data: {
          releaseNotes,
          file: fileReference,
          pluginId,
          releaseHash,
          downloads: 0,
        },
      });

      LOGGER_SESSION.log(
        "generic",
        `Uploaded new release for plugin ${pluginId}: ${release.id}`
      );
      return release;
    } catch (error) {
      LOGGER_SESSION.log("error", `Unable to create new release for plugin ID ${pluginId}: ${error}`);
      throw error;
    }
  }

  async getPluginById(pluginId: string) {
    try {
      const plugin = await prisma.exteraPlugin.findUnique({
        where: { id: pluginId },
      });

      if (!plugin) {
        throw new Error(`Plugin with ID ${pluginId} not found`);
      }

      return plugin;
    } catch (error) {
      LOGGER_SESSION.log("error", `Unable to fetch plugin ID ${pluginId}: ${error}`);
      throw error;
    }
  }

  async getAllPlugins() {
    try {
      return await prisma.exteraPlugin.findMany({
        include: {
          releases: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      LOGGER_SESSION.log("error", `Unable to fetch all plugins: ${error}`);
      throw error;
    }
  }

  async getLatestReleaseForPluginId(pluginId: string) {
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
      LOGGER_SESSION.log("error", `Unable to fetch latest release for plugin ID ${pluginId}: ${error}`);
      throw error;
    }
  }

  async getAllPluginNames() {
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

  async countStuff() {
    try {
      return {
        plugins: await prisma.exteraPlugin.count(),
        releases: await prisma.pluginRelease.count(),
      };
    } catch (error) {
      LOGGER_SESSION.log("error", `Unable to count plugins and releases: ${error}`);
      throw error;
    }
  }

  async updatePlugin(pluginId: string, name?: string, description?: string) {
    try {
      const updateData: Record<string, any> = {};

      if (name) {
        const { error } = PluginService.nameSchema.validate(name);
        if (error) throw new Error(`Invalid plugin name: ${error.message}`);
        updateData.name = name;
      }

      if (description !== undefined) {
        if (description) {
          const descError =
            PluginService.descriptionSchema.validate(description).error;
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

  async deletePlugin(pluginId: string) {
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
      LOGGER_SESSION.log("error", `Unable to delete plugin for plugin ID ${pluginId}: ${error}`);
      throw error;
    }
  }

  async getReleaseById(releaseId: string) {
    try {
      const release = await prisma.pluginRelease.findUnique({
        where: { id: releaseId },
        include: {
          plugin: true,
        },
      });

      if (!release) {
        LOGGER_SESSION.log("error", `Non-existent releaseId request: ${releaseId}`);
        return STATUS_ERR;
      }

      return release;
    } catch (error) {
      LOGGER_SESSION.log("error", `Release fetch error: ${error}`);
      throw error;
    }
  }

  async getAllReleasesForPlugin(pluginId: string) {
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

  async deleteRelease(releaseId: string) {
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

  async getReactions(pluginId: string) {
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

  async getPluginStars(pluginId: string) {
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

  async addPluginStar(userId: string, pluginId: string) {
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
}

export default new PluginService();
