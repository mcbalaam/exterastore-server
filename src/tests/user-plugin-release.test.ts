import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { pluginsGetHandler } from "../api/routes/plugins";

import { create, remove } from "../services/userService";
import {
  createPlugin,
  getPluginById,
	getReleaseById,
	getAllReleasesForPlugin,
	getLatestReleaseForPluginId,
  deletePlugin,
} from "../services/pluginService";