type useGlobal_ThemeMode = 'light' | 'dark'
type useGlobal_LayoutName = 'pc' | 'pad' | 'mobile'
type useGlobal_Locale = 'zh' | 'en'
export type { useGlobal_ThemeMode, useGlobal_LayoutName }

const layoutName = ref<useGlobal_LayoutName>('mobile')
function updateLayoutName(v: useGlobal_LayoutName) {
  layoutName.value = v
}

const themeMode = ref<useGlobal_ThemeMode>()
function updateThemeMode(v: useGlobal_ThemeMode) {
  themeMode.value = v
}

const tocVisible = ref<boolean>(false)
function updateTocVisible(v: boolean) {
  tocVisible.value = v
}

// ================ 多语言 ==================
const useGlobal_LOCALE_KEY = 'config.locale'
const locale = ref<useGlobal_Locale>((localStorage.getItem(useGlobal_LOCALE_KEY) as useGlobal_Locale) || 'en')
function updateLocale(v: useGlobal_Locale) {
  localStorage.setItem(useGlobal_LOCALE_KEY, v)
  locale.value = v
}

export default function () {
  return {
    state: {
      layoutName,
      themeMode,
      tocVisible,
      locale,
    },
    action: {
      updateLayoutName,
      updateThemeMode,
      updateTocVisible,
      updateLocale,
    },
  }
}
