import { type Messages } from '#domain/define'

const enUS: Messages = {
  'msg.reloading': 'Reloading...',
  'msg.reloadSuccessed': 'Reload Successed',
  'msg.reloadFailed': 'Reload Failed',
  'msg.timeout': 'Timeout!',
  'msg.creating{path}': '[ {path} ] Creating...',
  'msg.createSuccessed': 'Create Successed',
  'msg.createFailed': 'Create Failed {msg}',
  'msg.saving{path}': '[ {path} ] Saving...',
  'msg.saveSuccessed': 'Save Successed',
  'msg.saveFailed': 'Save Failed {msg}',
  'msg.deletingFile{path}': '[ {path} ] Deleting File...',
  'msg.deletingFolder{path}': '[ {path} ] Deleting Folder...',
  'msg.deleteSuccessed': 'Delete Successed',
  'msg.deleteFailed{msg}': 'Delete Failed: {msg}',
  'msg.renamingFile{path}': '[ {path} ] Renaming File...',
  'msg.renamingFolder{path}': '[ {path} ] Renaming Folder...',
  'msg.renameSuccessed': 'Rename Successed',
  'msg.renameFailed': 'Rename Failed {msg}',
  'msg.languageChanged{lang}': 'Language Changed To {lang}',
  'ctxmenu.openFile': 'Open File',
  'ctxmenu.copyPath': 'Copy Path',
  'ctxmenu.copyRelativePath': 'Copy Relative Path',
  'ctxmenu.renameFile': 'Rename File',
  'ctxmenu.deleteFile': 'Delete File',
  'ctxmenu.newFile': 'New File',
  'ctxmenu.newFolder': 'New Folder',
  'ctxmenu.renameFolder': 'Rename Folder',
  'ctxmenu.deleteFolder': 'Delete Folder',
  'ctxmenu.close': 'Close',
  'ctxmenu.closeOthers': 'Close Others',
  'ctxmenu.closeAll': 'Close All',
  'confirm.save': 'Save',
  'confirm.dontSave': "Don't Save",
  'confirm.delete': 'DELETE',
  'confirm.cancel': 'Cancel',
  'confirm.saveOnCloseTitle': 'Are you sure you want to save the changes to this file?',
  'confirm.saveOnCloseContent': 'If you do not save, your changes will be lost! \nCurrent file path: {path}',
  'confirm.deleteFileTitle': 'Are you sure you want to delete this file?',
  'confirm.deleteFolderTitle': 'Are you sure you want to delete this folder?',
  'confirm.deleteFileContent':
    'Operation is unable to undo, please ensure there are backups/version control on your server! \nCurrent path: {path}',
  'confirm.deleteFolderContent':
    'Operation is unable to undo, please ensure there are backups/version control on your server! \nCurrent path: {path}',
  'button.newFile': 'New File..',
  'button.newFolder': 'New Folder..',
  'button.refreshExplorer': 'Refresh Explorer',
  'button.collapseAll': 'Collapse Folders in Explorer',
  'button.rename': 'Rename..',
  'button.delete': 'Delete',
  'menu.manage': 'Manage',
  'menu.folders': 'Folders',
  'menu.settings': 'Settings',
  'menu.keyboardShortcuts': 'Keyboard Shortcuts',
  'settings.language': 'Language',
  'settings.colorTheme': 'Color Theme',
  'settings.colorTheme.dark': 'Dark',
  'settings.colorTheme.light': 'Light',
  'keybindings.toolBox.search': 'Type to search in keybindings',
  'keybindings.toolBox.reset': 'Reset',
  'keybindings.options.header.command': 'Command',
  'keybindings.options.header.keybinding': 'Keybinding',
  'keybindings.options.content.format': 'Format',
}

export default enUS
