import type { Files } from './types'
import { longestCommonPrefix } from '#lib/common'

export function getTabSizeByExtension(ext: string): number {
  return ['java', 'sql', 'py', 'sh', 'cpp', 'cs', 'c', 'h'].includes(ext) ? 4 : 2
}

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
