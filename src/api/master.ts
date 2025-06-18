// import generateMotd from "../misc/motd";
// import pluginService from "../services/pluginService";
// import userService from "../services/userService";

// type PluginHandler = (...args: any[]) => Promise<any>;
// type PluginHandlers = {
//   [key: string]: PluginHandler | PluginHandlers;
// };

// const idRegex = /^\d{16}$/;

// const handlers: Record<string, PluginHandler | PluginHandlers> = {
//   motd: () => Promise.resolve(generateMotd()),
//   plugins: {
//     all: () => pluginService.getAllPlugins(),
//     names: () => pluginService.getAllPluginNames(),

//     // Handling plugin requests

//     get: (id: string) => {
//       if (!idRegex.test(id)) {
//         return Promise.reject("Invalid plugin ID");
//       }
//       return pluginService.getPluginById(id);
//     },

//     releases: {
//       get: (id: string) => {
//         if (!idRegex.test(id)) {
//           return Promise.reject("Invalid plugin ID");
//         }
//         return pluginService.getAllReleasesForPlugin(id);
//       },
//       latest: (id: string) => {
//         if (!idRegex.test(id)) {
//           return Promise.reject("Invalid plugin ID");
//         }
//         return pluginService.getLatestReleaseForPluginId(id);
//       },
//     },

//     reactions: (id: string) => {
//       if (!idRegex.test(id)) {
//         return Promise.reject("Invalid plugin ID");
//       }
//       return pluginService.getReactions(id);
//     },

//     create: (data: any) => {
//       return pluginService.createPlugin(data);
//     },

//     update: (id: string, data: any) => {
//       if (!idRegex.test(id)) {
//         return Promise.reject("Invalid plugin ID");
//       }
//       return pluginService.updatePlugin(id, data);
//     },

//     delete: (id: string) => {
//       if (!idRegex.test(id)) {
//         return Promise.reject("Invalid plugin ID");
//       }
//       return pluginService.deletePlugin(id);
//     },

//     addRelease: (id: string, data: any) => {
//       if (!idRegex.test(id)) {
//         return Promise.reject("Invalid plugin ID");
//       }
//       return pluginService.addPluginRelease(id, data);
//     },

//     star: (id: string, userId: string) => {
//       if (!idRegex.test(id)) {
//         return Promise.reject("Invalid plugin ID");
//       }
//       return pluginService.toggleStar(id, userId);
//     },

//   } as PluginHandlers,

//   releases: {
//     get: (id: string) => {
//       return pluginService.getReleaseById(id);
//     },
//     delete: (id: string) => {
//       return pluginService.deleteRelease(id);
//     },
//   } as PluginHandlers,

//   users: {
//     register: (data: any) => {
//       return userService.registerUser(data);
//     },
//     updateUsername: (id: string, data: any) => {
//       return userService.updateUsername(id, data);
//     },
//     updateTitle: (id: string, data: any) => {
//       return userService.updateTitle(id, data);
//     },
//     updateDescription: (id: string, data: any) => {
//       return userService.updateDescription(id, data);
//     },
//     updateSupporterStatus: (id: string, data: any) => {
//       return userService.updateSupporterStatus(id, data);
//     },
//     updateProfile: (id: string, data: any) => {
//       return userService.updateProfile(id, data);
//     },
//     delete: (id: string) => {
//       return userService.deleteUser(id);
//     },
//   } as PluginHandlers,
// };

// export default function handleApiRequest(...args: string[]) {
//   const [mainRoute, subRoute, ...params] = args;

//   if (mainRoute in handlers) {
//     const handler = handlers[mainRoute];
//     if (typeof handler === "function") {
//       return handler(...params);
//     } else if (subRoute && subRoute in handler) {
//       const subHandler = handler[subRoute];
//       if (typeof subHandler === "function") {
//         return subHandler(...params);
//       }
//     }
//   }

//   return Promise.reject("Route not found");
// }
