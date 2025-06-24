import { Elysia } from "elysia";
import { validateSession } from "./api/middleware/session/validateSession";
import { masterKeyAuth } from "./api/middleware/auth/validateMasterKey";
import {
  pluginsAllHandler,
  pluginsCreateHandler,
  pluginsGetHandler,
  pluginsUpdateHandler,
  pluginsDeleteHandler,
  pluginsNamesHandler,
  pluginsReleasesHandler,
  pluginsReactionsHandler,
  pluginsAddReleaseHandler,
  pluginsStarHandler,
} from "./api/routes/plugins";
import {
  usersRegisterHandler,
  usersUpdateUsernameHandler,
  usersUpdateTitleHandler,
  usersUpdateBioHandler,
  usersToggleSupporterHandler,
  usersUpdateProfileHandler,
  usersDeleteHandler,
} from "./api/routes/users";
import {
  createReleaseFileHandler,
  getReleaseFileHandler,
  getAllReleaseFilesHandler,
  deleteReleaseFileHandler,
  deleteAllPluginReleasesHandler,
} from "./api/routes/files";
import { loggerSession } from "./lib/logger";

import {
  releasesGetHandler,
  releasesDeleteHandler,
} from "./api/routes/releases";

// Групповой middleware для всех защищённых маршрутов /plugins
const pluginsGuard = {
  beforeHandle: validateSession,
};

const LOGGER_SESSION = new loggerSession(true);
export default LOGGER_SESSION;

const app = new Elysia()

  // MOTD - публичный
  .get("/api/v1", () => ({
    motd: "Hello from exteraStore :KakkoiWave:",
    lastUpdated: "24.06.25",
  }));

// plugin getters
app.group("/api/v1/plugins", (app) =>
  app
    .get("/all", pluginsAllHandler)
    .get("/names", pluginsNamesHandler)
    .get("/:id", pluginsGetHandler)
    .get("/:id/releases", pluginsReleasesHandler)
    .get("/:id/reactions", pluginsReactionsHandler)
);

// plugin setters
app
  .group("/api/v1/plugins", (app) =>
    app.guard(pluginsGuard, (app) =>
      app
        .post("/", pluginsCreateHandler)
        .put("/:id", pluginsUpdateHandler)
        .delete("/:id", pluginsDeleteHandler)
        .post("/:id/releases", pluginsAddReleaseHandler)
        .post("/:id/star", pluginsStarHandler)
    )
  )

  // Релизы (Releases)
  .guard(pluginsGuard, (app) =>
    app
      .get("/releases/:id", releasesGetHandler)
      .delete("/releases/:id", releasesDeleteHandler)
  )

  .guard(pluginsGuard, (app) =>
    app
      // 1. Создать новый релиз (POST, multipart/form-data)
      .post("/files/:pluginId/:releaseId/:filename", createReleaseFileHandler)
      // 2. Получить файл релиза (GET)
      .get("/files/:pluginId/:releaseId/:filename", getReleaseFileHandler)
      // 3. Получить все файлы релизов плагина (GET)
      .get("/files/:pluginId", getAllReleaseFilesHandler)
      // 4. Удалить конкретный релиз (DELETE)
      .delete("/files/:pluginId/:releaseId", deleteReleaseFileHandler)
      // 5. Удалить все релизы и папку плагина (DELETE)
      .delete("/files/:pluginId", deleteAllPluginReleasesHandler)
  )

  // Пользователи (Users) — регистрация открыта, остальные действия требуют сессии
  .post("/users", usersRegisterHandler)
  .guard(pluginsGuard, (app) =>
    app
      .put("/users/:id/username", usersUpdateUsernameHandler)
      .put("/users/:id/title", usersUpdateTitleHandler)
      .put("/users/:id/description", usersUpdateBioHandler)
      .put("/users/:id/supporter", usersToggleSupporterHandler)
      .put("/users/:id/profile", usersUpdateProfileHandler)
      .delete("/users/:id", usersDeleteHandler)
  )

  .listen(3000);
