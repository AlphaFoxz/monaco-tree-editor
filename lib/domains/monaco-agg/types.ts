import * as monaco_lib from 'monaco-editor'

export type MonacoLib = typeof monaco_lib
export type Files = {
  [path: string]: FileInfo
}
export type FileInfo = {
  path?: string
  name?: string
  content?: string
  editing?: boolean
  status?: string
  isFile?: boolean
  isFolder?: boolean
  readonly?: boolean
  children?: { [path: string]: FileInfo } | null
}
export type OpenedFileInfo = { status?: 'editing' | 'saved'; path: string }
export const TYPE_MAP: {
  [key: string]: string
} = Object.freeze({
  js: 'javascript',
  ts: 'typescript',
  less: 'less',
  jsx: 'javascript',
  tsx: 'typescript',
  v: 'verilog',
  sv: 'systemverilog',
  restful: 'restful',
})
