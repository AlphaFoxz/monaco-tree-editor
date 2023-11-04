export type Files = {
  [path: string]: FileInfo
}

export type FileInfo = {
  path: string
  name?: string
  content?: string
  editing?: boolean
  status?: string
  isFile?: boolean
  isDirectory?: boolean
  children?: { [path: string]: FileInfo } | null
}
