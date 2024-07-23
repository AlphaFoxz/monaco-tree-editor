export type MessageType = 'info' | 'success' | 'warn' | 'error'
export type MessageOptions = {
  content: string
  closeable?: boolean
  loading?: boolean
  textTip?: string
  timeoutMs?: number
  id?: string
  type?: MessageType
}
