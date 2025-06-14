import prisma from "../lib/prisma";
import { updateLogFile } from "../lib/logger";
import Joi from "joi";
import '../constants'
import { STATUS_ERR } from "../constants";

class PluginService {
  static nameSchema = Joi.string().min(5).max(15);
  static descriptionSchema = Joi.string().min(0).max(300);
  static releaseNumberSchema = Joi.string().min(3).max(9);
  static releaseNotesSchema = Joi.string().min(0).max(100);

  async createPlugin(name: string, description?: string) {
    try {
      const { error } = PluginService.nameSchema.validate(name);
      if (error) throw new Error(`Invalid plugin name: ${error.message}`);

      if (description) {
        const descError =
          PluginService.descriptionSchema.validate(description).error;
        if (descError)
          throw new Error(`Invalid description: ${descError.message}`);
      }

      const plugin = await prisma.exteraPlugin.create({
        data: {
          name,
          description,
        },
      });

      updateLogFile("generic", `Created new plugin: ${plugin.id}`);
      return plugin;
    } catch (error) {
      console.error("Plugin creation error:", error);
      throw error;
    }
  }

  async createRelease(
    pluginId: string,
    fileReference: string,
    releaseNotes?: string
  ) {
    try {
      // Validating release notes if provided
      if (releaseNotes) {
        const { error } =
          PluginService.releaseNotesSchema.validate(releaseNotes);
        if (error) throw new Error(`Invalid release notes: ${error.message}`);
      }

      // Check if plugin exists
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
        },
      });

      updateLogFile(
        "generic",
        `Created new release for plugin ${pluginId}: ${release.id}`
      );
      return release;
    } catch (error) {
      console.error("Release creation error:", error);
      throw error;
    }
  }

  async getPluginById(pluginId: string) {
    try {
      const plugin = await prisma.exteraPlugin.findUnique({
        where: { id: pluginId },
        include: {
          releases: true,
        },
      });

      if (!plugin) {
        throw new Error(`Plugin with ID ${pluginId} not found`);
      }

      return plugin;
    } catch (error) {
      console.error("Plugin fetch error:", error);
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
          name: "asc",
        },
      });
    } catch (error) {
      console.error("Plugins fetch error:", error);
      throw error;
    }
  }

  async updatePlugin(pluginId: string, name?: string, description?: string) {
    try {
      // Создаём объект для обновления
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

      updateLogFile("generic", `Updated plugin ${pluginId}`);
      return updatedPlugin;
    } catch (error) {
      console.error("Plugin update error:", error);
      throw error;
    }
  }

  async deletePlugin(pluginId: string) {
    try {
      // First delete all releases to maintain referential integrity
      await prisma.pluginRelease.deleteMany({
        where: { pluginId },
      });

      const deletedPlugin = await prisma.exteraPlugin.delete({
        where: { id: pluginId },
      });

      updateLogFile("generic", `Deleted plugin ${pluginId}`);
      return deletedPlugin;
    } catch (error) {
      console.error("Plugin deletion error:", error);
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
        updateLogFile("error", `Non-existent releaseId request: ${releaseId}`);
				return STATUS_ERR
      }

      return release;
    } catch (error) {
      console.error("Release fetch error:", error);
      throw error;
    }
  }

	async getAllReleasesForPlugin(pluginId: string) {
    try {
      const releases = await prisma.pluginRelease.findMany({
        where: { plugin: await prisma.exteraPlugin.findUnique({where: {id: pluginId}}) },
        include: {
          pluginRelease: true,
        },
      });

      return releases;
    } catch (error) {
      updateLogFile("error", `Couldn't fetch releases for ${pluginId}`);
      throw error;
    }
  }

  async deleteRelease(releaseId: string) {
    try {
      const deletedRelease = await prisma.pluginRelease.delete({
        where: { id: releaseId },
      });

      updateLogFile("generic", `Deleted release ${releaseId}`);
      return deletedRelease;
    } catch (error) {
      console.error("Release deletion error:", error);
      throw error;
    }
  }
}

export default new PluginService();
