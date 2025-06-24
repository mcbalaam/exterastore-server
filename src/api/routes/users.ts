import type { Context } from "elysia";

export const STATUS_INVALID_NAME = "Invalid name";
export const STATUS_INVALID_DESCRIPTION = "Invalid description";
export const STATUS_ERR = "Error";

import {
  create,
  updateUsername,
  entitle,
  updateBio,
  toggleSupporter,
  updateProfile,
  remove,
  getUserById,
  getUserByUsername,
  getUserByTelegramId,
  updatePreferences,
  checkUsernameExists,
  getUserStars,
} from "../../services/userService";

export const usersRegisterHandler = async ({ body, set }: Context) => {
  try {
    const userData = body as {
      telegramId: string;
      username: string;
      passwordHash: string;
      profilePicture?: string;
    };

    const newUser = await create(userData);
    return newUser;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const usersUpdateUsernameHandler = async ({
  params,
  body,
  set,
}: Context) => {
  try {
    const { id } = params;
    const { newUsername } = body as { newUsername: string };

    const updatedUser = await updateUsername(id, newUsername);
    return updatedUser;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const usersUpdateTitleHandler = async ({
  params,
  body,
  set,
}: Context) => {
  try {
    const { id } = params;
    const { newTitle } = body as { newTitle: string };

    const updatedUser = await entitle(id, newTitle);
    return updatedUser;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const usersUpdateBioHandler = async ({ params, body, set }: Context) => {
  try {
    const { id } = params;
    const { newBio } = body as { newBio: string };

    await updateBio(id, newBio);
    return { success: true };
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const usersToggleSupporterHandler = async ({
  params,
  body,
  set,
}: Context) => {
  try {
    const { id } = params;
    const { status } = body as { status: boolean };

    const updatedUser = await toggleSupporter(id, status);
    return updatedUser;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const usersUpdateProfileHandler = async ({
  params,
  body,
  set,
}: Context) => {
  try {
    const { id } = params;
    const updates = body as {
      username?: string;
      title?: string;
      profilePicture?: string;
      preferences?: any;
    };

    const updatedUser = await updateProfile(id, updates);
    return updatedUser;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const usersDeleteHandler = async ({ params, set }: Context) => {
  try {
    const { id } = params;
    const result = await remove(id);
    return result;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

// Получение пользователя по ID
export const getUserByIdHandler = async ({ params, set }: Context) => {
  try {
    const { id } = params;
    const user = await getUserById(id);
    return user;
  } catch (error) {
    set.status = 404;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

// Получение пользователя по username
export const getUserByUsernameHandler = async ({ params, set }: Context) => {
  try {
    const { username } = params;
    const user = await getUserByUsername(username);
    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }
    return user;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

// Получение пользователя по Telegram ID
export const getUserByTelegramIdHandler = async ({ params, set }: Context) => {
  try {
    const { telegramId } = params;
    const user = await getUserByTelegramId(telegramId);
    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }
    return user;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

// Обновление предпочтений пользователя
export const updatePreferencesHandler = async ({
  params,
  body,
  set,
}: Context) => {
  try {
    const { id } = params;
    const { preferences } = body as { preferences: any };

    const updatedUser = await updatePreferences(id, preferences);
    return updatedUser;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

// Проверка существования username
export const usernameExistsHandler = async ({ params, set }: Context) => {
  try {
    const { username } = params;
    const exists = await checkUsernameExists(username);
    return { exists };
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

// Получение звезд пользователя
export const getUserStarsHandler = async ({ params, set }: Context) => {
  try {
    const { userId } = params;
    const stars = await getUserStars(userId);
    return stars;
  } catch (error) {
    set.status = 400;
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
