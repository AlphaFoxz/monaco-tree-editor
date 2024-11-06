type MessagesKey =
  | 'msg.reloading'
  | 'msg.reloadSuccessed'
  | 'msg.reloadFailed'
  | 'msg.timeout'
  | 'msg.creating{path}'
  | 'msg.createSuccessed'
  | 'msg.createFailed'
  | 'msg.saving{path}'
  | 'msg.saveSuccessed'
  | 'msg.saveFailed'
  | 'msg.deletingFile{path}'
  | 'msg.deletingFolder{path}'
  | 'msg.deleteSuccessed'
  | 'msg.deleteFailed{msg}'
  | 'msg.renamingFile{path}'
  | 'msg.renamingFolder{path}'
  | 'msg.renameSuccessed'
  | 'msg.renameFailed'
  | 'msg.languageChanged{lang}'
  | 'ctxmenu.openFile'
  | 'ctxmenu.copyPath'
  | 'ctxmenu.copyRelativePath'
  | 'ctxmenu.renameFile'
  | 'ctxmenu.deleteFile'
  | 'ctxmenu.newFile'
  | 'ctxmenu.newFolder'
  | 'ctxmenu.renameFolder'
  | 'ctxmenu.deleteFolder'
  | 'ctxmenu.close'
  | 'ctxmenu.closeOthers'
  | 'ctxmenu.closeAll'
  | 'confirm.save'
  | 'confirm.dontSave'
  | 'confirm.delete'
  | 'confirm.cancel'
  | 'confirm.saveOnCloseTitle'
  | 'confirm.saveOnCloseContent'
  | 'confirm.deleteFileTitle'
  | 'confirm.deleteFolderTitle'
  | 'confirm.deleteFileContent'
  | 'confirm.deleteFolderContent'
  | 'button.newFile'
  | 'button.newFolder'
  | 'button.refreshExplorer'
  | 'button.collapseAll'
  | 'button.rename'
  | 'button.delete'
  | 'menu.manage'
  | 'menu.folders'
  | 'menu.settings'
  | 'menu.keyboardShortcuts'
  | 'settings.language'
  | 'settings.colorTheme'
  | 'settings.colorTheme.dark'
  | 'settings.colorTheme.light'
  | 'keybindings.toolBox.search'
  | 'keybindings.toolBox.reset'
  | 'keybindings.options.header.command'
  | 'keybindings.options.header.keybinding'
  | 'keybindings.options.content.format'

export type Messages = {
  [key in MessagesKey]: string
}

export type KeyName =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | '`'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '0'
  | '-'
  | '='
  | '['
  | ']'
  | '\\'
  | ';'
  | "'"
  | ','
  | '.'
  | '/'
  | 'Space'
  | 'Tab'
  | 'Enter'
  | 'Escape'
  | 'Backspace'
  | 'Delete'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12'
  | 'Insert'
  | 'Shift'
  | 'Ctrl'
  | 'Alt'

export const FACADE_KEY_MAP: Readonly<Record<string, KeyName>> = Object.freeze({
  '~': '`',
  '!': '1',
  '@': '2',
  '#': '3',
  $: '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  _: '-',
  '+': '=',
  '{': '[',
  '}': ']',
  '|': '\\',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '?': '/',
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
  e: 'E',
  f: 'F',
  g: 'G',
  h: 'H',
  i: 'I',
  j: 'J',
  k: 'K',
  l: 'L',
  m: 'M',
  n: 'N',
  o: 'O',
  p: 'P',
  q: 'Q',
  r: 'R',
  s: 'S',
  t: 'T',
  u: 'U',
  v: 'V',
  w: 'W',
  x: 'X',
  y: 'Y',
  z: 'Z',
})

export function toFacadeKey(key: string | undefined): KeyName | undefined {
  if (key === undefined) {
    return key
  }
  const length = key.length
  if (length !== 1) {
    return key as KeyName
  }
  if (FACADE_KEY_MAP[key]) {
    return FACADE_KEY_MAP[key] as KeyName
  }
  return key as KeyName
}

export enum BuiltInPage {
  '<Settings>' = '<Settings>',
  '<KeyboardShortcuts>' = '<KeyboardShortcuts>',
}

export type BuiltInPageType = keyof typeof BuiltInPage
