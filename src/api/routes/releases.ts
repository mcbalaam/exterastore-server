import type { Context } from "elysia";
import { getReleaseById } from "../../services/pluginService";
import { deleteRelease } from "../../services/releaseService";

// Получить релиз по id
export const releasesGetHandler = async ({ params, set }: Context) => {
  try {
    const { id } = params;
    const release = await getReleaseById(id);
    return release;
  } catch (error) {
    set.status = 404;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

// Удалить релиз по id
export const releasesDeleteHandler = async ({ params, set }: Context) => {
  try {
    const { id } = params;
    const deleted = await deleteRelease(id);
    return deleted;
  } catch (error) {
    set.status = 404;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
