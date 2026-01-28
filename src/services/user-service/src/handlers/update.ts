import { type Context } from "elysia";
import {
  updateBio,
  updatePreferences,
  updateProfile,
  updateUsername,
  entitle,
  toggleSupporter,
} from "../service/update";
import { NotFoundError, ValidationError } from "../lib/errors";

export const _getUserById = async ({ params, set }: Context) => {
  try {
    const user = await updateBio(params.id, params.content);
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      set.status = 404;
      return { ERROR_CODE: "0x01", error: "User does not exist" };
    }
    if (error instanceof ValidationError) {
      set.status = 400;
      return {
        ERROR_CODE: "0x21",
        error:
          "Bio must not be longer than 100 symbols and only include [a-zA-Z0-9!@#$%^&*()]",
      };
    }
    set.status = 500;
    return { ERROR_CODE: "0x00", error: "Internal server error" };
  }
};
