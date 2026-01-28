import { ERROR_CODE, type Context } from "elysia";
import { getUserById, getUserByTelegramId, getUserByUsername } from "../service/get";
import { NotFoundError } from "../lib/errors";

export const _getUserById = async ({ params, set }: Context) => {
    try {
        const user = await getUserById(params.id);
        return user;
    } catch (error) {
        if (error instanceof NotFoundError) {
            set.status = 404;
            return { ERROR_CODE: '0x01', error: 'User does not exist' };
        }
        set.status = 500;
        return { ERROR_CODE: '0x00', error: 'Internal server error' };
    }
}

export const _getUserByTelegramId = async ({ params, set }: Context) => {
    try {
        const user = await getUserByTelegramId(params.id);
        return user;
    } catch (error) {
        if (error instanceof NotFoundError) {
            set.status = 404;
            return { ERROR_CODE: '0x01', error: 'User does not exist' };
        }
        set.status = 500;
        return { ERROR_CODE: '0x00', error: 'Internal server error' };
    }
}

export const _getUserByUsername = async ({ params, set }: Context) => {
    try {
        const user = await getUserByUsername(params.username);
        return user;
    } catch (error) {
        if (error instanceof NotFoundError) {
            set.status = 404;
            return { ERROR_CODE: '0x01', error: 'User does not exist' };
        }
        set.status = 500;
        return { ERROR_CODE: '0x00', error: 'Internal server error' };
    }
}