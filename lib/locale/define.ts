type keys =
  | 'settings.language'
  | 'settings.colorTheme'
  | 'settings.colorTheme.dark'
  | 'settings.colorTheme.light'
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

export type Messages = {
  [key in keys]: string
}
export type Language = 'en-US' | 'zh-CN'
