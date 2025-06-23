// services/releaseService.ts
import prisma from "../lib/prisma";
import LOGGER_SESSION from "..";

class ReleaseService {
  // Получить релиз по id
  async getReleaseById(releaseId: string) {
    try {
      const release = await prisma.pluginRelease.findUnique({
        where: { id: releaseId },
        include: {
          plugin: true, // если нужно вернуть плагин вместе с релизом
        },
      });
      if (!release) throw new Error("Release not found");
      return release;
    } catch (error) {
      LOGGER_SESSION.log("error", `Get release error: ${error}`);
      throw error;
    }
  }

  // Удалить релиз по id
  async deleteRelease(releaseId: string) {
    try {
      const deleted = await prisma.pluginRelease.delete({
        where: { id: releaseId },
      });
      LOGGER_SESSION.log("generic", `Deleted release: ${releaseId}`);
      return deleted;
    } catch (error) {
      LOGGER_SESSION.log("error", `Delete release error: ${error}`);
      throw error;
    }
  }
}

export default new ReleaseService();
