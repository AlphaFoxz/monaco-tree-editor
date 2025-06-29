import type { FileInfo, Files } from './types'
import { longestCommonPrefix } from '#lib/common'
import type { Ref } from 'vue'

export function prepareFiles(files: Files) {
  const fixedFiles: Files = {}
  let projectPrefix = '/'
  let fileSeparator = '/'
  projectPrefix = longestCommonPrefix(Object.keys(files))
  if (projectPrefix.endsWith('\\') || projectPrefix.endsWith('/')) {
    projectPrefix = projectPrefix.substring(0, projectPrefix.length - 1)
  }
  let projectName = projectPrefix.replace(/\\/g, '/')
  projectName = projectName.substring(projectName.lastIndexOf('/') + 1)
  console.debug('projectName', projectName)
  Object.keys(files).forEach((path) => {
    if (path.includes('\\')) {
      fileSeparator = '\\'
    }
    const info = files[path]
    path = path.replace(projectPrefix, '')
    path = path.replace(/\\/g, '/')
    fixedFiles[path] = {
      ...info,
      path: path,
    }
  })
  files = fixedFiles
  return {
    files,
    prefix: projectPrefix,
    fileSeparator,
    projectName,
  }
}

export function removeInvalidFileByPath(fileTree: Ref<FileInfo>, path: string) {
  const paths = path.startsWith('/') ? path.slice(1).split('/') : path.split('/')
  if (!paths || !paths[paths.length - 1]) {
    return
  }
  let children: Files = fileTree.value.children!
  paths.forEach((v, index) => {
    if (index === paths.length - 1) {
      delete children[v]
    } else if (children[v]) {
      children = children[v].children!
    }
  })
}

export function newFolder(param: { fileTree: Ref<FileInfo>; path: string }) {
  const { path, fileTree } = param
  const paths = path.startsWith('/') ? path.slice(1).split('/') : path.split('/')
  const tree = fileTree.value
  let temp: Files = tree.children!
  paths.forEach((v, index) => {
    if (index === paths.length - 1) {
      temp[''] = {
        name: '',
        path,
        content: '',
        readonly: false,
        isFile: false,
        isFolder: true,
        children: {},
      }
    } else if (temp[v]) {
      temp = temp[v].children!
    }
  })
  fileTree.value = tree
}

export function newFile(param: { fileTree: Ref<FileInfo>; path: string }) {
  const { path, fileTree } = param
  const paths = path.startsWith('/') ? path.slice(1).split('/') : path.split('/')
  const tree = fileTree.value
  let temp: Files = tree.children!
  paths.forEach((v, index) => {
    if (index === paths.length - 1) {
      temp[''] = {
        name: '',
        path,
        content: '',
        readonly: false,
        isFile: true,
        isFolder: false,
        children: undefined,
      }
    } else if (temp[v]) {
      temp = temp[v].children!
    }
  })
  fileTree.value = tree
}
