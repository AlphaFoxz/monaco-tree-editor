// https://nuxt.com/docs/api/configuration/nuxt-config
const prefix = process.env.NUXT_APP_BASE_URL || ''
export default defineNuxtConfig({
  devtools: { enabled: true },
  router: {
    options: {
      strict: true,
    },
  },
  ssr: false,
  css: ['primeicons/primeicons.css', '~/assets/styles/default.scss'],
  modules: ['@nuxt/content', '@primevue/nuxt-module', '@nuxtjs/color-mode'],
  runtimeConfig: {
    public: {
      NUXT_APP_BASE_URL: prefix,
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
        img: 'Image',
      },
    },
    documentDriven: {
      injectPage: false,
    },
    experimental: {
      clientDB: process.env.NODE_ENV === 'development' ? false : true,
      search: {
        indexed: true,
      },
    },
    highlight: {
      theme: 'github-dark',
      langs: ['json', 'js', 'ts', 'html', 'vue', 'shell', 'md', 'yaml', 'java', 'kt', 'sql'],
    },
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
  },
  primevue: {
    components: {
      exclude: '*',
    },
  },
  vite: {
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
  compatibilityDate: '2024-08-19',
})
