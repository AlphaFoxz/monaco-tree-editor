type useGlobal_ThemeMode = 'light' | 'dark'
type useGlobal_LayoutName = 'pc' | 'pad' | 'mobile'
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

export default function () {
  return {
    state: {
      layoutName,
      themeMode,
      tocVisible,
    },
    action: {
      updateLayoutName,
      updateThemeMode,
      updateTocVisible,
    },
  }
}
