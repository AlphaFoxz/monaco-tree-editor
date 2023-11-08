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

export type MessageType = 'info' | 'success' | 'warn' | 'error'
export type MessageOptions = {
  content: string
  closeable?: boolean
  loading?: boolean
  timeoutMs?: number
  id?: string
  type?: MessageType
}
