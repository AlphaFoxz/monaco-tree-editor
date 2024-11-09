import { type Messages } from '../domain/define'

const zhCN: Messages = {
  'msg.reloading': '加载中...',
  'msg.reloadSuccessed': '加载成功',
  'msg.reloadFailed': '加载失败',
  'msg.timeout': '等待超时！',
  'msg.creating{path}': '[ {path} ] 创建中...',
  'msg.createSuccessed': '创建成功',
  'msg.createFailed': '创建失败 {msg}',
  'msg.saving{path}': '[ {path} ] 保存中...',
  'msg.saveSuccessed': '保存成功',
  'msg.saveFailed': '保存失败 {msg}',
  'msg.deletingFile{path}': '[ {path} ] 正在删除文件...',
  'msg.deletingFolder{path}': '[ {path} ] 正在删除文件夹...',
  'msg.deleteSuccessed': '删除成功',
  'msg.deleteFailed{msg}': '删除失败 {msg}',
  'msg.renamingFile{path}': '[ {path} ] 正在重命名文件...',
  'msg.renamingFolder{path}': '[ {path} ] 正在重命名文件夹...',
  'msg.renameSuccessed': '重命名成功',
  'msg.renameFailed': '重命名失败 {msg}',
  'msg.languageChanged{lang}': '语言已切换为 {lang}',
  'ctxmenu.openFile': '打开文件',
  'ctxmenu.copyPath': '复制路径',
  'ctxmenu.copyRelativePath': '复制相对路径',
  'ctxmenu.renameFile': '文件重命名',
  'ctxmenu.deleteFile': '删除文件',
  'ctxmenu.newFile': '新建文件',
  'ctxmenu.newFolder': '新建文件夹',
  'ctxmenu.renameFolder': '文件夹重命名',
  'ctxmenu.deleteFolder': '删除文件夹',
  'ctxmenu.close': '关闭',
  'ctxmenu.closeOthers': '关闭其他',
  'ctxmenu.closeAll': '关闭所有',
  'confirm.save': '保存',
  'confirm.dontSave': '不保存',
  'confirm.delete': '删除',
  'confirm.cancel': '取消',
  'confirm.saveOnCloseTitle': '是否要保存对本文件的修改',
  'confirm.saveOnCloseContent': '如果不保存，你的更改将丢失！\n当前文件路径: {path}',
  'confirm.deleteFileTitle': '是否要删除此文件',
  'confirm.deleteFolderTitle': '是否要删除此文件夹',
  'confirm.deleteFileContent': '删除操作不可恢复，请确认服务端有备份/版本控制！\n当前路径: {path}',
  'confirm.deleteFolderContent': '删除操作不可恢复，请确认服务端有备份/版本控制！\n当前路径: {path}',
  'button.newFile': '新建文件...',
  'button.newFolder': '新建文件夹...',
  'button.refreshExplorer': '刷新',
  'button.collapseAll': '折叠文件夹',
  'button.rename': '重命名...',
  'button.delete': '删除',
  'menu.manage': '管理',
  'menu.folders': '文件夹',
  'menu.settings': '设置',
  'menu.keyboardShortcuts': '快捷键',
  'settings.language': '语言',
  'settings.colorTheme': '颜色主题',
  'settings.colorTheme.dark': '深色',
  'settings.colorTheme.light': '浅色',
  'keybindings.toolBox.search': '在按键绑定中输入要搜索的内容',
  'keybindings.toolBox.reset': '重置',
  'keybindings.options.header.command': '命令',
  'keybindings.options.header.keybinding': '快捷键',
  'keybindings.options.content.format': '格式化',
}

export default zhCN
