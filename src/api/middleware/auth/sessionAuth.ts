// import { Elysia } from "elysia";
// import { validateSessionToken } from "../path/to/session"; // Укажите правильный путь

// export const sessionAuth = new Elysia({ name: "session-auth" })
//   .onBeforeHandle(async ({ set, request }) => {
//     const authHeader = request.headers.get("authorization");
//     const sessionToken = authHeader?.replace("Bearer ", "");

//     if (!sessionToken) {
//       set.status = 401;
//       return { error: "Session token required" };
//     }

//     try {
//       const session = await validateSessionToken(sessionToken);
//       if (session?.user) {
//         return; // Разрешить запрос
//       }
//     } catch (error) {
//       // Логирование ошибки при необходимости
//     }

//     set.status = 401;
//     return { error: "Session validation failed" };
//   });
