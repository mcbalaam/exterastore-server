import { prisma } from "./lib/prisma";
import logger from "./lib/logger";

export async function addPluginStar(userId: string, pluginId: string) {
  try {
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      throw new Error("Plugin not found");
    }

    const existingStar = await prisma.pluginStar.findUnique({
      where: {
        userId_pluginId: {
          userId,
          pluginId
        }
      }
    });

    if (existingStar) {
      throw new Error("Already starred");
    }

    const star = await prisma.pluginStar.create({
      data: {
        userId,
        pluginId
      },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    logger.info("Plugin star added", { userId, pluginId, starId: star.id });

    return star;
  } catch (error) {
    logger.error("Error adding plugin star", error as Error);
    throw error;
  }
}

export async function removePluginStar(userId: string, pluginId: string) {
  try {
    const star = await prisma.pluginStar.delete({
      where: {
        userId_pluginId: {
          userId,
          pluginId
        }
      }
    });

    logger.info("Plugin star removed", { userId, pluginId });

    return { success: true, deletedId: star.id };
  } catch (error) {
    logger.error("Error removing plugin star", error as Error);
    throw error;
  }
}

export async function togglePluginStar(userId: string, pluginId: string) {
  try {
    const existingStar = await prisma.pluginStar.findUnique({
      where: {
        userId_pluginId: {
          userId,
          pluginId
        }
      }
    });

    if (existingStar) {
      await prisma.pluginStar.delete({
        where: { id: existingStar.id }
      });
      
      logger.info("Plugin star removed", { userId, pluginId });
      
      return { starred: false };
    } else {
      await prisma.pluginStar.create({
        data: {
          userId,
          pluginId
        }
      });
      
      logger.info("Plugin star added", { userId, pluginId });
      
      return { starred: true };
    }
  } catch (error) {
    logger.error("Error toggling plugin star", error as Error);
    throw error;
  }
}

export async function getUserPluginStars(userId: string) {
  try {
    const stars = await prisma.pluginStar.findMany({
      where: { userId },
      include: {
        plugin: {
          include: {
            releases: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    logger.info("User stars fetched", { userId, count: stars.length });

    return stars.map(star => ({
      ...star.plugin,
      starredAt: star.createdAt
    }));
  } catch (error) {
    logger.error("Error fetching user stars", error as Error);
    throw error;
  }
}

export async function getPluginStarsCount(pluginId: string) {
  try {
    const count = await prisma.pluginStar.count({
      where: { pluginId }
    });

    return { pluginId, starsCount: count };
  } catch (error) {
    logger.error("Error counting plugin stars", error as Error);
    throw error;
  }
}

export async function checkUserStarred(userId: string, pluginId: string) {
  try {
    const star = await prisma.pluginStar.findUnique({
      where: {
        userId_pluginId: {
          userId,
          pluginId
        }
      }
    });

    return { starred: !!star };
  } catch (error) {
    logger.error("Error checking user star", error as Error);
    throw error;
  }
}

export async function getPluginStarredUsers(pluginId: string, limit: number = 10) {
  try {
    const stars = await prisma.pluginStar.findMany({
      where: { pluginId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        userId: true,
        createdAt: true
      }
    });

    return stars;
  } catch (error) {
    logger.error("Error fetching plugin starred users", error as Error);
    throw error;
  }
}