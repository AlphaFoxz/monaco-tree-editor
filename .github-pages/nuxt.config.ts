import fs from "node:fs";

// https://nuxt.com/docs/api/configuration/nuxt-config
const prefix = process.env.NUXT_APP_BASE_URL || "";
let defaultLocale = "zh";
const locales = [];
if (fs.existsSync("./content/zh")) {
  locales.push({ code: "zh", file: "zh.json", name: "中文" });
}
if (fs.existsSync("./content/en")) {
  locales.push({ code: "en", file: "en.json", name: "English" });
  defaultLocale = "en";
}

export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    host: "0.0.0.0",
  },
  router: {
    options: {
      strict: true,
    },
  },
  ssr: false,
  css: ["primeicons/primeicons.css", "~/assets/styles/default.scss"],
  modules: [
    "@nuxt/content",
    "@primevue/nuxt-module",
    "@nuxtjs/color-mode",
    "@nuxtjs/i18n",
    "@nuxt/image",
  ],
  runtimeConfig: {
    public: {
      NUXT_APP_BASE_URL: prefix,
      NUXT_APP_DEFAULT_LOCALE: defaultLocale,
      NUXT_APP_LOCALE_LIST: locales,
    },
  },
  app: {
    head: {
      link: [
        // {
        //   id: 'theme-link',
        //   rel: 'stylesheet',
        //   href: prefix + '/styles/aura-light-green/theme.css',
        // },
      ],
    },
  },
  content: {
    markdown: {
      tags: {
        img: "Image",
      },
    },
    documentDriven: {
      navigation: true,
      injectPage: false,
    },
    experimental: {
      clientDB: process.env.NODE_ENV === "development" ? false : true,
      search: {
        indexed: true,
      },
    },
    highlight: {
      theme: "github-dark",
      langs: [
        "json",
        "js",
        "ts",
        "html",
        "vue",
        "shell",
        "md",
        "yaml",
        "java",
        "kt",
        "sql",
      ],
    },
  },
  i18n: {
    langDir: "locales/",
    defaultLocale,
    locales,
    strategy: "prefix",
  },
  colorMode: {
    preference: "system",
    fallback: "light",
  },
  primevue: {
    components: {
      exclude: "*",
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    esbuild: {
      drop: ["console", "debugger"],
    },
  },
  compatibilityDate: "2024-10-04",
});
