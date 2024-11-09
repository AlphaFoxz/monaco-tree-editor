import type { Files } from './types'
import { longestCommonPrefix } from '../../common'

export function fixFilesPath(files: Files) {
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
  // monacoStore.actions._setPrefix(projectPrefix)
  // monacoStore.actions._setFileSeparator(fileSeparator)
  return {
    files,
    prefix: projectPrefix,
    fileSeparator,
    projectName,
  }
}
