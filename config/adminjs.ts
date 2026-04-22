import type { AdminJSProviderConfig } from "@adminjs/adonis";

import authProvider from "../app/admin/auth.js";
import { componentLoader } from "../app/admin/component_loader.js";
import { adminjsResources } from "../app/admin/resources/index.js";

const adminjsConfig: AdminJSProviderConfig = {
  adapter: {
    enabled: true,
  },
  adminjs: {
    rootPath: "/admin",
    loginPath: "/admin/login",
    logoutPath: "/admin/logout",
    componentLoader,
    resources: adminjsResources,
    pages: {},
    locale: {
      availableLanguages: ["en"],
      language: "en",
      translations: {
        en: {
          actions: {},
          messages: {},
          labels: {
            booths: "Booths",
            booth_statuses: "Booth Status History",
            file_entries: "Uploaded Files",
            users: "Admin Users",
          },
          buttons: {},
          properties: {},
          components: {},
          pages: {},
        },
      },
    },
    branding: {
      companyName: "ToPWR Booths Admin",
      theme: {},
    },
    settings: {
      defaultPerPage: 50,
    },
  },
  auth: {
    enabled: true,
    provider: authProvider,
    middlewares: [],
  },
  middlewares: [],
};

export default adminjsConfig;
