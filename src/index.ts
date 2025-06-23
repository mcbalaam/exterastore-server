import { Elysia } from "elysia";
import { validateSession } from "./api/middleware/session/validateSession";
import { masterKeyAuth } from "./api/middleware/auth/validateMasterKey";
import { pluginsAllHandler, pluginsCreateHandler, pluginsGetHandler, pluginsUpdateHandler, pluginsDeleteHandler, pluginsNamesHandler, pluginsReleasesHandler, pluginsReactionsHandler, pluginsAddReleaseHandler, pluginsStarHandler } from "./api/routes/plugins"
import { usersRegisterHandler, usersUpdateUsernameHandler, usersUpdateTitleHandler, usersUpdateBioHandler, usersToggleSupporterHandler, usersUpdateProfileHandler, usersDeleteHandler } from "./api/routes/users"
import { loggerSession } from "./lib/logger";

import { releasesGetHandler, releasesDeleteHandler } from "./api/routes/releases";


// Групповой middleware для всех защищённых маршрутов /plugins
const pluginsGuard = {
	beforeHandle: validateSession
};

const LOGGER_SESSION = new loggerSession(true)
export default LOGGER_SESSION;

const app = new Elysia()

// MOTD - публичный
.get("/api/v1", () => ({
    motd: 'Hello from exteraStore :KakkoiWave:',
    lastUpdated: '21.06.25'
}))

// Плагины (Plugins)
.guard(pluginsGuard, app => app
	// Получить все плагины (полная информация)
	.get("/plugins/all", pluginsAllHandler)
	// Получить только имена плагинов
	.get("/plugins/names", pluginsNamesHandler)
	// Получить плагин по id
	.get("/plugins/:id", pluginsGetHandler)
	// Получить релизы плагина
	.get("/plugins/:id/releases", pluginsReleasesHandler)
	// Получить реакции плагина
	.get("/plugins/:id/reactions", pluginsReactionsHandler)
	// Создать новый плагин (POST)
	.post("/plugins", pluginsCreateHandler)
	// Обновить плагин (PUT)
	.put("/plugins/:id", pluginsUpdateHandler)
	// Удалить плагин (DELETE)
	.delete("/plugins/:id", pluginsDeleteHandler)
	// Добавить релиз к плагину (POST)
	.post("/plugins/:id/releases", pluginsAddReleaseHandler)
	// Поставить/снять звезду (POST)
	.post("/plugins/:id/star", pluginsStarHandler)
)

// Релизы (Releases)
.guard(pluginsGuard, app => app
    .get("/releases/:id", releasesGetHandler)
    .delete("/releases/:id", releasesDeleteHandler)
)

// Пользователи (Users) — регистрация открыта, остальные действия требуют сессии
.post("/users", usersRegisterHandler)
.guard(pluginsGuard, app => app
	.put("/users/:id/username", usersUpdateUsernameHandler)
	.put("/users/:id/title", usersUpdateTitleHandler)
	.put("/users/:id/description", usersUpdateBioHandler)
	.put("/users/:id/supporter", usersToggleSupporterHandler)
	.put("/users/:id/profile", usersUpdateProfileHandler)
	.delete("/users/:id", usersDeleteHandler)
)

.listen(3000);
