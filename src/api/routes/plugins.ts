import type { Context } from "elysia";
import {
  getAllPlugins,
  getAllPluginNames,
  getPluginById,
  getAllReleasesForPlugin,
  getReactions,
  createPlugin,
  updatePlugin,
  deletePlugin,
  createRelease,
  addPluginStar,
} from "../../services/pluginService";

export const STATUS_INVALID_NAME = "Invalid name";
export const STATUS_INVALID_DESCRIPTION = "Invalid description";
export const STATUS_ERR = "Error";

/// All plugins as an array
export const pluginsAllHandler = async ({ set }: Context) => {
  const plugins = await getAllPlugins().catch(() => null);
  if (!plugins) {
    set.status = 404;
    return { error: "Unable to fetch plugin list; refer to the log output" };
  }
  return plugins;
};

/// Fetches a plugin by it's ID
export const pluginsGetHandler = async ({ params, set }: Context) => {
  const plugin = await getPluginById(params.id).catch(() => null);
  if (!plugin) {
    set.status = 404;
    return { error: "Plugin not found" };
  }
  return plugin;
};

export const pluginsNamesHandler = async ({ set }: Context) => {
  const plugins = await getAllPluginNames().catch(() => null);
  if (!plugins) {
    set.status = 404;
    return { error: "Unable to fetch plugin names; refer to the log output" };
  }
  return plugins;
};

export const pluginsReleasesHandler = async ({ params, set }: Context) => {
  const plugins = await getAllReleasesForPlugin(params.id).catch(() => null);
  if (!plugins) {
    set.status = 404;
    return { error: `Releases for plugin ${params.id} not found` };
  }
  return plugins;
};

export const pluginsReactionsHandler = async ({ params, set }: Context) => {
  const plugins = await getReactions(params.id).catch(() => null);
  return plugins;
};

export const pluginsCreateHandler = async ({ body, set }: Context) => {
  const { name, license, description } = body as {
    name: string;
    license: string;
    description?: string;
  };

  try {
    const result = await createPlugin(name, license, description);

    // Используем реальные значения, возвращаемые сервисом
    if (result === STATUS_INVALID_NAME) {
      set.status = 400;
      return { error: "Invalid plugin name: must be 5-15 characters" };
    }
    if (result === STATUS_INVALID_DESCRIPTION) {
      set.status = 400;
      return { error: "Invalid description: must be up to 300 characters" };
    }
    if (result === STATUS_ERR) {
      set.status = 500;
      return { error: "Internal error while creating plugin" };
    }

    return result;
  } catch (error) {
    set.status = 500;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const pluginsUpdateHandler = async ({ params, body, set }: Context) => {
  const { name, description } = body as { name?: string; description?: string };

  try {
    const result = await updatePlugin(params.id, name, description);

    return result;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const pluginsDeleteHandler = async ({ params, set }: Context) => {
  try {
    const result = await deletePlugin(params.id);
    return result;
  } catch (error) {
    set.status = 404;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const pluginsAddReleaseHandler = async ({
  params,
  body,
  set,
}: Context) => {
  const { fileReference, releaseHash, releaseNotes } = body as {
    fileReference: string;
    releaseHash: string;
    releaseNotes?: string;
  };

  try {
    const result = await createRelease(
      params.id,
      fileReference,
      releaseHash,
      releaseNotes
    );
    return result;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const pluginsStarHandler = async ({ params, body, set }: Context) => {
  const { userId } = body as { userId: string };

  try {
    const result = await addPluginStar(userId, params.id);
    return result;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
