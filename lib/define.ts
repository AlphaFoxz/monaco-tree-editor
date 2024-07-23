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
export enum BuiltInPage {
  '<Settings>' = '<Settings>',
  '<KeyboardShortcuts>' = '<KeyboardShortcuts>',
}

export type BuiltInPageType = keyof BuiltInPage
