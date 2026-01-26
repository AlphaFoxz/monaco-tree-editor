import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'monaco-tree-editor',
  description: 'A Vue 3 library that provides a VSCode-like web editor component with an integrated file tree',
  base: '/monaco-tree-editor/',

  // Configure multiple locales - VitePress will detect browser language
  // and redirect users to the appropriate language version
  locales: {
    'en-US': {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en-US/' },
          { text: 'Guide', link: '/en-US/guide/' },
          { text: 'GitHub', link: 'https://github.com/AlphaFoxz/monaco-tree-editor' },
        ],
        sidebar: {
          '/en-US/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/en-US/guide/' },
                { text: 'Installation', link: '/en-US/guide/install' },
                { text: 'Demo', link: '/en-US/guide/demo' },
              ],
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Custom Menus Agg', link: '/en-US/guide/customMenusAgg' },
                { text: 'i18n', link: '/en-US/guide/i18n' },
                { text: 'Theme', link: '/en-US/guide/theme' },
                { text: 'Custom Drag', link: '/en-US/guide/customDrag' },
              ],
            },
            {
              text: 'Domains',
              items: [
                { text: 'Introduction', link: '/en-US/guide/domains/' },
                { text: 'Monaco Agg', link: '/en-US/guide/domains/monacoAgg' },
                { text: 'Message Agg', link: '/en-US/guide/domains/messageAgg' },
                { text: 'Hotkey Agg', link: '/en-US/guide/domains/hotkeyAgg' },
              ],
            },
          ],
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/AlphaFoxz/monaco-tree-editor' },
        ],
      },
    },
    'zh-CN': {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '主页', link: '/zh-CN/' },
          { text: '文档', link: '/zh-CN/guide/' },
          { text: 'GitHub', link: 'https://github.com/AlphaFoxz/monaco-tree-editor' },
        ],
        sidebar: {
          '/zh-CN/guide/': [
            {
              text: '开始',
              items: [
                { text: '简介', link: '/zh-CN/guide/' },
                { text: '安装', link: '/zh-CN/guide/install' },
                { text: '演示', link: '/zh-CN/guide/demo' },
              ],
            },
            {
              text: '高级',
              items: [
                { text: '自定义菜单聚合', link: '/zh-CN/guide/customMenusAgg' },
                { text: '国际化', link: '/zh-CN/guide/i18n' },
                { text: '主题', link: '/zh-CN/guide/theme' },
                { text: '自定义拖拽', link: '/zh-CN/guide/customDrag' },
              ],
            },
            {
              text: '领域',
              items: [
                { text: '领域简介', link: '/zh-CN/guide/domains/' },
                { text: 'Monaco 聚合', link: '/zh-CN/guide/domains/monacoAgg' },
                { text: 'Message 聚合', link: '/zh-CN/guide/domains/messageAgg' },
                { text: 'Hotkey 聚合', link: '/zh-CN/guide/domains/hotkeyAgg' },
              ],
            },
          ],
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/AlphaFoxz/monaco-tree-editor' },
        ],
      },
    },
  },
});
