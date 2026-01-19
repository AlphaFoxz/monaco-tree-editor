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

/**
 * Types for Monaco Editor internal APIs
 * These are not officially exposed but are used for customization
 */
export interface MonacoCodeEditorService {
  openCodeEditor(
    input: MonacoEditorInput,
    source: monaco_lib.editor.ICodeEditor,
    sideBySide?: boolean
  ): Promise<boolean>
}

export interface MonacoEditorInput {
  resource: monaco_lib.Uri
  options?: {
    selection?: monaco_lib.Selection
    [key: string]: unknown
  }
}

export interface MonacoEditorWithService extends monaco_lib.editor.IStandaloneCodeEditor {
  _codeEditorService: MonacoCodeEditorService
}
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
