import * as monaco_lib from 'monaco-editor'
import type { ThemeMode } from '#domain/define'
import type { Ref } from 'vue'

export function getTabSizeByExtension(ext: string): number {
  return ['java', 'sql', 'py', 'sh', 'cpp', 'cs', 'c', 'h'].includes(ext) ? 4 : 2
}

export function resize(
  tabsHeightCss: string,
  editorDom: HTMLElement,
  editor: monaco_lib.editor.IStandaloneCodeEditor
): void {
  editorDom.style.height = `calc(100% - ${tabsHeightCss})`
  editor?.layout()
}

export async function defineTheme(param: {
  untilDomMounted: Promise<void>
  monaco: Ref<typeof monaco_lib>
  themeName: ThemeMode
  theme: monaco_lib.editor.IStandaloneThemeData
}) {
  await param.untilDomMounted
  param.monaco.value!.editor.defineTheme(param.themeName, param.theme)
}

export async function setTheme(untilDomMounted: Promise<void>, monaco: Ref<typeof monaco_lib>, themeName: ThemeMode) {
  await untilDomMounted
  // 定义主题
  console.debug('切换monaco主题', name)
  // 设置主题
  monaco.value!.editor.setTheme(themeName)
}
